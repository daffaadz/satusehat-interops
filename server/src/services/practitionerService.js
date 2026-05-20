const axios = require('axios');
const config = require('../config');
const { getAccessToken } = require('./satusehatAuthService');
const { handleSatusehatError } = require('../utils/satusehatError');

const FHIR_BASE = `${config.satusehat.baseUrl}/fhir-r4/v1`;

const getPractitionerByNik = async (nik) => {
  const token = await getAccessToken();
  const url = `${FHIR_BASE}/Practitioner?identifier=https://fhir.kemkes.go.id/id/nik|${nik}`;

  let response;
  try {
    response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
  } catch (err) {
    throw handleSatusehatError(err, 'Practitioner');
  }

  const bundle = response.data;
  if (!bundle.entry || bundle.entry.length === 0) {
    const e = new Error(`Dokter dengan NIK ${nik} tidak ditemukan`);
    e.statusCode = 404;
    throw e;
  }

  const practitioner = bundle.entry[0].resource;
  const nameEntry = practitioner.name?.[0];
  return {
    ihsNumber: practitioner.id,
    name: nameEntry?.text || nameEntry?.family || 'Dokter',
  };
};

module.exports = { getPractitionerByNik };
