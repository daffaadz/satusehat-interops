const express = require('express');
const router = express.Router();
const {
  getToken,
  getPatient,
  getPractitioner,
  postLocation,
  getLocationsList,
  postEncounter,
  debugPractitioner,
  debugSearchPractitioner,
} = require('../controllers/registrationController');

router.get('/token', getToken);
router.get('/patient/:nik', getPatient);
router.get('/practitioner/:nik', getPractitioner);
router.post('/location', postLocation);
router.get('/location', getLocationsList);
router.post('/encounter', postEncounter);

// Debug: coba semua format identifier untuk NIK tertentu
router.get('/debug/practitioner-nik/:nik', debugPractitioner);
// Debug: cari practitioner by name atau list semua
router.get('/debug/practitioner', debugSearchPractitioner);

module.exports = router;
