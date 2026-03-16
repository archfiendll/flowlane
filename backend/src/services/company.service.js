'use strict';

const prisma = require('../config/prisma');

function mapCompany(company) {
  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    legalAddress: company.legalAddress,
    city: company.city,
    country: company.country,
    bankName: company.bankName,
    iban: company.iban,
    legalRepName: company.legalRepName,
    legalRepTitle: company.legalRepTitle,
    profileRO: company.profileRO,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
}

async function getCompany(companyId) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { profileRO: true },
  });

  if (!company || company.deletedAt) {
    const err = new Error('Company not found');
    err.status = 404;
    throw err;
  }

  return mapCompany(company);
}

async function upsertCompany(companyId, data) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  });

  if (!company) {
    const err = new Error('Company not found');
    err.status = 404;
    throw err;
  }

  const companyData = {
    name: data.name?.trim(),
    legalAddress: data.legalAddress?.trim() ?? '',
    city: data.city?.trim() ?? '',
    country: data.country?.trim() ?? '',
    bankName: data.bankName?.trim() || null,
    iban: data.iban?.trim() || null,
    legalRepName: data.legalRepName?.trim() ?? '',
    legalRepTitle: data.legalRepTitle?.trim() ?? '',
  };

  const profileROInput = data.profileRO;

  const updated = await prisma.$transaction(async (tx) => {
    await tx.company.update({
      where: { id: companyId },
      data: companyData,
    });

    if (profileROInput) {
      const hasProfileData = [
        profileROInput.cui,
        profileROInput.caenCode,
        profileROInput.county,
        profileROInput.tradeRegister,
        profileROInput.vatPayer ? 'true' : '',
      ].some((value) => value !== undefined && value !== null && String(value).trim() !== '');

      if (hasProfileData) {
        await tx.companyProfileRO.upsert({
          where: { companyId },
          update: {
            cui: profileROInput.cui?.trim() ?? '',
            caenCode: profileROInput.caenCode?.trim() ?? '',
            county: profileROInput.county?.trim() ?? '',
            tradeRegister: profileROInput.tradeRegister?.trim() || null,
            vatPayer: Boolean(profileROInput.vatPayer),
          },
          create: {
            companyId,
            cui: profileROInput.cui?.trim() ?? '',
            caenCode: profileROInput.caenCode?.trim() ?? '',
            county: profileROInput.county?.trim() ?? '',
            tradeRegister: profileROInput.tradeRegister?.trim() || null,
            vatPayer: Boolean(profileROInput.vatPayer),
          },
        });
      } else {
        await tx.companyProfileRO.deleteMany({
          where: { companyId },
        });
      }
    }

    return tx.company.findUnique({
      where: { id: companyId },
      include: { profileRO: true },
    });
  });

  return mapCompany(updated);
}

module.exports = { getCompany, upsertCompany };
