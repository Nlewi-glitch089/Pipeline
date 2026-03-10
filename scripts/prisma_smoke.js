const { PrismaClient } = require('@prisma/client');
(async () => {
  const p = new PrismaClient();
  try {
    await p.$connect();
    const res = await p.$queryRaw`SELECT 1 as ok`;
    console.log('prisma-ok', res);
    await p.$disconnect();
    process.exit(0);
  } catch (e) {
    console.error(e);
    try { await p.$disconnect(); } catch (e2) {}
    process.exit(3);
  }
})();
