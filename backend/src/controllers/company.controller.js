'use strict';

const companyService = require('../services/company.service');
const { sendError, sendSuccess } = require('../utils/response');
const errorCodes = require('../utils/errorCodes');

async function getMine(req, res) {
  const company = await companyService.getCompany(req.companyId);
  return sendSuccess(res, { company });
}

async function updateMine(req, res) {
  const { name, legalAddress, city, country, legalRepName, legalRepTitle } = req.body;
  const profileRO = req.body.profileRO || null;

  if (!name || !legalAddress || !city || !country || !legalRepName || !legalRepTitle) {
    return sendError(
      res,
      'Name, legal address, city, country, legal representative name, and title are required',
      errorCodes.VALIDATION_001,
      400,
    );
  }

  if (profileRO) {
    const hasAnyRomanianProfileField = [
      profileRO.cui,
      profileRO.caenCode,
      profileRO.county,
      profileRO.tradeRegister,
      profileRO.vatPayer ? 'true' : '',
    ].some((value) => value && String(value).trim() !== '');

    const hasRequiredRomanianFields = profileRO.cui && profileRO.caenCode && profileRO.county;

    if (hasAnyRomanianProfileField && !hasRequiredRomanianFields) {
      return sendError(
        res,
        'Romanian company profile requires CUI, CAEN code, and county',
        errorCodes.VALIDATION_001,
        400,
      );
    }
  }

  const company = await companyService.upsertCompany(req.companyId, req.body);
  return sendSuccess(res, { company });
}

module.exports = { getMine, updateMine };
