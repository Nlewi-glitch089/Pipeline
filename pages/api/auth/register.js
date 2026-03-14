import prisma from '../../../lib/prisma';
import crypto from 'crypto';

function hashPassword(plain) {
  return crypto.createHash('sha256').update(plain).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email, password, name } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'password must be at least 6 characters' });
  }

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists' });
  }

  const user = await prisma.user.create({
    data: {
      email:    email.toLowerCase().trim(),
      name:     name || email.split('@')[0],
      password: hashPassword(password),
    },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  return res.status(201).json(user);
}
