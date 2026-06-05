const { Op } = require('sequelize');
const Practitioner = require('../models/Practitioner');
const { sendSuccess, sendError } = require('../utils/response');

const listPractitioners = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { nik: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Practitioner.findAndCountAll({
      where,
      attributes: ['nik', 'name', 'ihsNumber'], // Only return requested fields
      order: [['name', 'ASC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });

    return sendSuccess(res, {
      data: rows,
      total: count,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(count / limit)
    }, 'Daftar practitioner berhasil diambil');
  } catch (err) {
    next(err);
  }
};

const getPractitionerByNik = async (req, res, next) => {
  try {
    const { nik } = req.params;
    const practitioner = await Practitioner.findOne({
      where: { nik },
      attributes: ['nik', 'name', 'ihsNumber'],
    });

    if (!practitioner) {
      return sendError(res, 'Practitioner tidak ditemukan di database lokal', 404);
    }

    return sendSuccess(res, practitioner, 'Data practitioner ditemukan');
  } catch (err) {
    next(err);
  }
};

module.exports = { listPractitioners, getPractitionerByNik };
