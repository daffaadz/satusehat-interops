const axios = require('axios');
const crypto = require('crypto');
const config = require('../config');
const { getAccessToken } = require('./satusehatAuthService');
const { handleSatusehatError } = require('../utils/satusehatError');

const FHIR_BASE = `${config.satusehat.baseUrl}/fhir-r4/v1`;

const createEncounter = async ({
  patientIhsNumber,
  patientName,
  practitionerIhsNumber,
  practitionerName,
  locationId,
  locationName,
}) => {
  const token = await getAccessToken();
  const orgId = config.satusehat.orgId;
  const startTimestamp = new Date().toISOString();

  // ID unik encounter — wajib per SATUSEHAT RuleNumber: 10117
  const encounterId = crypto.randomUUID();

  const payload = {
    resourceType: 'Encounter',
    identifier: [
      {
        system: `http://sys-ids.kemkes.go.id/encounter/${orgId}`,
        value: encounterId,
      },
    ],
    status: 'arrived',
    // Riwayat status — wajib per SATUSEHAT RuleNumber: 10122
    statusHistory: [
      {
        status: 'arrived',
        period: {
          start: startTimestamp,
        },
      },
    ],
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'AMB',
      display: 'ambulatory',
    },
    subject: {
      reference: `Patient/${patientIhsNumber}`,
      display: patientName,
    },
    participant: [
      {
        type: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                code: 'ATND',
                display: 'attender',
              },
            ],
          },
        ],
        individual: {
          reference: `Practitioner/${practitionerIhsNumber}`,
          display: practitionerName,
        },
      },
    ],
    period: {
      start: startTimestamp,
    },
    location: [
      {
        location: {
          reference: `Location/${locationId}`,
          display: locationName,
        },
      },
    ],
    serviceProvider: {
      reference: `Organization/${orgId}`,
    },
  };

  let response;
  try {
    response = await axios.post(`${FHIR_BASE}/Encounter`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error('[Encounter] Error response:', JSON.stringify(err.response?.data, null, 2));
    throw handleSatusehatError(err, 'Encounter');
  }

  return { encounterId: response.data.id, status: response.data.status };
};

module.exports = { createEncounter };
