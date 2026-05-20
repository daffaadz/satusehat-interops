/**
 * Ubah axios error dari SATUSEHAT menjadi error yang informatif.
 * Mengekstrak FHIR OperationOutcome sehingga pesan error asli dari SATUSEHAT ikut tampil.
 */
const handleSatusehatError = (err, context = '') => {
  const status = err.response?.status;
  const data = err.response?.data;

  if (status === 401) {
    const e = new Error('Token SATUSEHAT tidak valid atau telah kadaluarsa');
    e.statusCode = 401;
    return e;
  }

  // Ekstrak pesan dari FHIR OperationOutcome
  let detail = '';
  if (data?.issue && Array.isArray(data.issue)) {
    detail = data.issue
      .map((i) => i.diagnostics || i.details?.text || i.details?.coding?.[0]?.display || i.code)
      .filter(Boolean)
      .join(' | ');
  } else if (data?.message) {
    detail = data.message;
  } else if (typeof data === 'string') {
    detail = data;
  }

  const message = detail
    ? `SATUSEHAT ${context} error (${status}): ${detail}`
    : `SATUSEHAT ${context} error: Request failed with status code ${status}`;

  const e = new Error(message);
  e.statusCode = status >= 400 && status < 600 ? status : 500;
  e.satusehatResponse = data;
  return e;
};

module.exports = { handleSatusehatError };
