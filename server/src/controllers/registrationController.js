const axios = require('axios');
const config = require('../config');
const { debugPractitionerNik, searchPractitionerByName } = require('../services/debugService');
const { registerPatient } = require('../services/registrationService');
const { getPatientByNik } = require('../services/patientService');
const { getPractitionerByNik } = require('../services/practitionerService');
const { createLocation, getLocations } = require('../services/locationService');
const { createEncounter } = require('../services/encounterService');
const { getAccessToken } = require('../services/satusehatAuthService');
const { sendSuccess, sendError } = require('../utils/response');

// POST /api/v1/register — Orkestrasi penuh pendaftaran pasien
const register = async (req, res, next) => {
  try {
    const {
      patientNik,
      practitionerNik,
      locationId,
      locationName,
    } = req.body;

    const result = await registerPatient({ patientNik, practitionerNik, locationId, locationName });
    return sendSuccess(res, result, 'Pendaftaran pasien berhasil', 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/satusehat/token — Ambil access token (debug/testing)
const getToken = async (req, res, next) => {
  try {
    const token = await getAccessToken();
    return sendSuccess(res, { access_token: token }, 'Token berhasil diambil');
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/satusehat/patient/:nik — Cari pasien berdasarkan NIK
const getPatient = async (req, res, next) => {
  try {
    const { nik } = req.params;
    const data = await getPatientByNik(nik);
    return sendSuccess(res, data, 'Data pasien ditemukan');
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/satusehat/location — Buat resource Location
const postLocation = async (req, res, next) => {
  try {
    let params;

    if (req.body && req.body.resourceType === 'Location') {
      params = req.body;
    } else {
      const { locationName, name, status, description, identifier, identifierValue: rawIdentifierValue } = req.body;

      let identifierValue;
      // Terima format string langsung (dari client modal)
      if (rawIdentifierValue) {
        identifierValue = rawIdentifierValue;
      // Atau format array FHIR: identifier: [{ value: "..." }]
      } else if (identifier && Array.isArray(identifier) && identifier.length > 0) {
        identifierValue = identifier[0].value;
      }

      params = name
        ? { name, status, identifierValue, description }
        : locationName;
    }

    const data = await createLocation(params);
    return sendSuccess(res, data, 'Location berhasil dibuat', 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/satusehat/location — Ambil daftar Location berdasarkan orgId
const getLocationsList = async (req, res, next) => {
  try {
    const data = await getLocations();
    return sendSuccess(res, data, 'Daftar Location berhasil diambil');
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/satusehat/encounter — Buat resource Encounter
const postEncounter = async (req, res, next) => {
  try {
    const {
      patientIhsNumber,
      patientName,
      practitionerIhsNumber,
      practitionerName,
      locationId,
      locationName,
    } = req.body;

    if (!patientIhsNumber || !practitionerIhsNumber || !locationId) {
      return sendError(res, 'patientIhsNumber, practitionerIhsNumber, dan locationId wajib diisi', 400);
    }

    const data = await createEncounter({
      patientIhsNumber,
      patientName,
      practitionerIhsNumber,
      practitionerName,
      locationId,
      locationName,
    });
    return sendSuccess(res, data, 'Encounter berhasil dibuat', 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/satusehat/debug/practitioner-nik/:nik — Coba semua format identifier
const debugPractitioner = async (req, res, next) => {
  try {
    const { nik } = req.params;
    const results = await debugPractitionerNik(nik);
    return sendSuccess(res, results, 'Debug: hasil semua percobaan identifier');
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/satusehat/debug/practitioner?name=&birthdate=&gender= — Cari by nama+tgl lahir
const debugSearchPractitioner = async (req, res, next) => {
  try {
    const { name, birthdate, gender } = req.query;
    const result = await searchPractitionerByName({ name, birthdate, gender });
    return sendSuccess(res, result, 'Debug: hasil pencarian practitioner');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  getToken,
  getPatient,
  postLocation,
  getLocationsList,
  postEncounter,
  debugPractitioner,
  debugSearchPractitioner,
};
