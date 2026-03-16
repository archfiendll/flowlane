'use strict';

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const { sendInviteEmail } = require('./email.service');

async function createInvitation({ companyId, email, role }) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const err = new Error('A user with this email already exists');
    err.status = 409;
    throw err;
  }

  // Cancel any existing pending invitations for this email in this company
  await prisma.invitation.updateMany({
    where: { companyId, email, status: 'PENDING' },
    data: { status: 'EXPIRED' },
  });

  // Generate a secure random token
  const rawToken = crypto.randomBytes(32).toString('hex');

  const invitation = await prisma.invitation.create({
    data: {
      companyId,
      email,
      role: role || 'employee',
      token: rawToken,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Get company name for the email
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true },
  });

  const inviteUrl = `${process.env.FRONTEND_URL}/invite/accept?token=${rawToken}`;

  await sendInviteEmail({
    to: email,
    companyName: company.name,
    inviteUrl,
  });

  return { id: invitation.id, email: invitation.email, role: invitation.role };
}

async function acceptInvitation({ token, password }) {
  // Find the invitation
  const invitation = await prisma.invitation.findUnique({ where: { token } });

  if (!invitation) {
    const err = new Error('Invalid invitation token');
    err.status = 400;
    throw err;
  }

  if (invitation.status !== 'PENDING') {
    const err = new Error('This invitation has already been used or expired');
    err.status = 400;
    throw err;
  }

  if (new Date() > invitation.expiresAt) {
    await prisma.invitation.update({
      where: { token },
      data: { status: 'EXPIRED' },
    });
    const err = new Error('This invitation has expired');
    err.status = 400;
    throw err;
  }

  

  const hashed = await bcrypt.hash(password, 12);

  // Create user + mark invitation as accepted in one transaction
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: invitation.email,
        password: hashed,
        role: invitation.role,
        companyId: invitation.companyId,
      },
      select: { id: true, email: true, role: true, companyId: true },
    });

    await tx.invitation.update({
      where: { token },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    });

    return user;
  });

  return result;
}
async function getInvitationByToken(token) {
  const invitation = await prisma.invitation.findUnique({ where: { token } });

  if (!invitation || invitation.status !== 'PENDING' || new Date() > invitation.expiresAt) {
    const err = new Error('Invalid or expired invitation');
    err.status = 400;
    throw err;
  }

  return { email: invitation.email, role: invitation.role };
}

async function listInvitations(companyId) {
  const invitations = await prisma.invitation.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      expiresAt: true,
      acceptedAt: true,
      createdAt: true,
    },
  });

  const employeeMatches = await prisma.employee.findMany({
    where: {
      companyId,
      personalEmail: { in: invitations.map((invitation) => invitation.email) },
    },
    select: {
      personalEmail: true,
      firstName: true,
      lastName: true,
      department: { select: { id: true, name: true } },
    },
  });

  const employeeByEmail = employeeMatches.reduce((acc, employee) => {
    acc.set(employee.personalEmail?.toLowerCase(), employee);
    return acc;
  }, new Map());

  return invitations.map((invitation) => ({
    ...invitation,
    status:
      invitation.status === 'PENDING' && new Date(invitation.expiresAt) < new Date()
        ? 'EXPIRED'
        : invitation.status,
    employee: employeeByEmail.get(invitation.email.toLowerCase()) || null,
  }));
}

async function revokeInvitation(companyId, invitationId) {
  const invitation = await prisma.invitation.findFirst({
    where: { id: invitationId, companyId },
  });

  if (!invitation) {
    const err = new Error('Invitation not found');
    err.status = 404;
    throw err;
  }

  if (invitation.status !== 'PENDING') {
    const err = new Error('Only pending invitations can be revoked');
    err.status = 409;
    throw err;
  }

  return prisma.invitation.update({
    where: { id: invitationId },
    data: { status: 'EXPIRED' },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      expiresAt: true,
      createdAt: true,
    },
  });
}

module.exports = {
  createInvitation,
  acceptInvitation,
  getInvitationByToken,
  listInvitations,
  revokeInvitation,
};
