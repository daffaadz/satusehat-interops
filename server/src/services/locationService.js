const axios = require('axios');
const config = require('../config');
const { getAccessToken } = require('./satusehatAuthService');
const { handleSatusehatError } = require('../utils/satusehatError');

const FHIR_BASE = `${config.satusehat.baseUrl}/fhir-r4/v1`;

const createLocation = async (locationName = 'Ruang Poli Umum') => {
  const token = await getAccessToken();
  const orgId = config.satusehat.orgId;

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

  console.log('[Location] POST payload:', JSON.stringify(payload, null, 2));

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
