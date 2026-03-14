const prisma = require('../../lib/prisma');

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
      return res.status(200).json(users);
    }

    if (req.method === 'POST') {
      const { email, name } = req.body || {};
      if (!email) return res.status(400).json({ error: 'email is required' });
      const user = await prisma.user.create({ data: { email, name } });
      return res.status(201).json(user);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error('API /api/users error', err);
    return res.status(500).json({ error: 'internal_server_error' });
  }
};
