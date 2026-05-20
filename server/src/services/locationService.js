const axios = require('axios');
const config = require('../config');
const { getAccessToken } = require('./satusehatAuthService');
const { handleSatusehatError } = require('../utils/satusehatError');

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
const createLocation = async (locationName = 'Ruang Poli Umum') => {
  const token = await getAccessToken();
  const orgId = config.satusehat.orgId;

  // Cek apakah sudah ada
  const existingId = await findExistingLocation(locationName, token);
  if (existingId) {
    console.log(`[Location] Sudah ada (id: ${existingId}), skip create.`);
    return { locationId: existingId, locationName };
  }

  const payload = {
    resourceType: 'Location',
    status: 'active',
    name: locationName,
    description: locationName,
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

  console.log('[Location] Creating new location:', locationName);

  let response;
  try {
    response = await axios.post(`${FHIR_BASE}/Location`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error('[Location] Error response:', JSON.stringify(err.response?.data, null, 2));
    throw handleSatusehatError(err, 'Location');
  }

  return { locationId: response.data.id, locationName };
};

module.exports = { createLocation };
