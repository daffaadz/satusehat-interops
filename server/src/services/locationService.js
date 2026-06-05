const axios = require('axios');
const config = require('../config');
const { getAccessToken } = require('./satusehatAuthService');
const { handleSatusehatError } = require('../utils/satusehatError');
const Location = require('../models/Location');

const FHIR_BASE = `${config.satusehat.baseUrl}/fhir-r4/v1`;

/**
 * Cari Location yang sudah ada berdasarkan nama dan organisasi.
 * @returns {string|null} locationId atau null jika tidak ditemukan
 */
const findExistingLocation = async (locationName, token) => {
  const orgId = config.satusehat.orgId;
  const url = `${FHIR_BASE}/Location?name=${encodeURIComponent(locationName)}&organization=${orgId}`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const bundle = response.data;
    if (bundle.entry && bundle.entry.length > 0) {
      return bundle.entry[0].resource.id;
    }
  } catch (_) {
    // Kalau search gagal, lanjut ke create
  }
  return null;
};

/**
 * GET-or-CREATE Location di SATUSEHAT.
 * Jika sudah ada Location dengan nama yang sama, pakai ID yang sudah ada.
 * Jika belum ada, buat baru.
 */
const createLocation = async (params) => {
  let name, status = 'active', identifierValue, description;
  let payload;

  const token = await getAccessToken();
  const orgId = config.satusehat.orgId;

  if (typeof params === 'string') {
    name = params;
    description = params;
  } else if (params && typeof params === 'object') {
    if (params.resourceType === 'Location') {
      // Temukan dan ganti {{Org_id}} placeholder dengan real orgId
      let jsonString = JSON.stringify(params);
      jsonString = jsonString.replace(/\{\{Org_id\}\}/g, orgId);
      payload = JSON.parse(jsonString);

      name = payload.name;
      delete payload.id; // hapus ID bawaan agar tidak konflik saat POST
    } else {
      name = params.name;
      status = params.status || 'active';
      identifierValue = params.identifierValue;
      description = params.description || params.name;
    }
  } else {
    name = 'Ruang Poli Umum';
    description = 'Ruang Poli Umum';
  }

  // Cek apakah sudah ada
  const existingId = await findExistingLocation(name, token);
  if (existingId) {
    console.log(`[Location] Sudah ada (id: ${existingId}), skip create.`);
    return { locationId: existingId, locationName: name };
  }

  if (!payload) {
    payload = {
      resourceType: 'Location',
      status: status,
      name: name,
      description: description,
      mode: 'instance',
      physicalType: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/location-physical-type',
            code: 'ro',
            display: 'Room',
          },
        ],
      },
      managingOrganization: {
        reference: `Organization/${orgId}`,
      },
    };

    if (identifierValue) {
      payload.identifier = [
        {
          system: `http://sys-ids.kemkes.go.id/location/${orgId}`,
          value: identifierValue,
        },
      ];
    }
  }

  console.log('[Location] Creating new location:', name);

  let response;
  try {
    response = await axios.post(`${FHIR_BASE}/Location`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Simpan ke database lokal
    await Location.create({
      locationId: response.data.id,
      name: name,
    });
  } catch (err) {
    console.error('[Location] Error response:', JSON.stringify(err.response?.data, null, 2));
    throw handleSatusehatError(err, 'Location');
  }

  return { locationId: response.data.id, locationName: name };
};

/**
 * Mengambil daftar Location terdaftar untuk organisasi yang diatur di config.
 */
const getLocations = async () => {
  const token = await getAccessToken();
  const orgId = config.satusehat.orgId;
  const url = `${FHIR_BASE}/Location?organization=${orgId}`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (err) {
    console.error('[Location] Error fetching locations:', JSON.stringify(err.response?.data, null, 2));
    throw handleSatusehatError(err, 'Location');
  }
};

/**
 * Sinkronisasi semua Location dari SATUSEHAT ke database lokal.
 * Berguna saat baru pertama kali setup atau ada Location yang dibuat di luar aplikasi ini.
 */
const syncLocationsToLocalDB = async () => {
  const satusehatData = await getLocations();
  const entries = satusehatData?.entry || [];
  
  let syncedCount = 0;
  for (const entry of entries) {
    const loc = entry.resource;
    if (loc && loc.id && loc.name) {
      const [record, created] = await Location.findOrCreate({
        where: { locationId: loc.id },
        defaults: { name: loc.name },
      });
      
      // Jika sudah ada tapi namanya beda di SATUSEHAT, kita update
      if (!created && record.name !== loc.name) {
        await record.update({ name: loc.name });
      }
      
      syncedCount++;
    }
  }
  
  console.log(`[Location] Sinkronisasi selesai. Total tersinkron: ${syncedCount}`);
  return syncedCount;
};

module.exports = { createLocation, getLocations, syncLocationsToLocalDB };
