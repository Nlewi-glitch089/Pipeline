const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function ok(msg){ console.log('[ok] ' + msg); }
function fail(msg){ console.error('[fail] ' + msg); process.exitCode = 2; }

const projectRoot = path.resolve(__dirname, '..', '..');
const applier = path.join(projectRoot, 'scripts', 'apply_sql_migration_neon.sh');
const migrationsDir = path.join(projectRoot, 'scripts', 'sql', 'migrations');

console.log('Running lightweight smoke checks...');

if (fs.existsSync(applier)) ok('Found migration applier: scripts/apply_sql_migration_neon.sh');
else fail('Missing scripts/apply_sql_migration_neon.sh');

if (fs.existsSync(migrationsDir)) ok('Found migrations directory: scripts/sql/migrations');
else fail('Missing scripts/sql/migrations (expected baseline SQL)');

const pkg = require(path.join(projectRoot, 'package.json'));
if (pkg.scripts && pkg.scripts.start) ok('package.json has start script');
else fail('package.json missing start script');

if (process.argv.includes('--full')){
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl){
    fail('Full smoke requested but DATABASE_URL is not set in environment');
    process.exit(2);
  }
  console.log('Running full migration apply (this will attempt to connect to DATABASE_URL)');
  const r = spawnSync(applier, { shell: true, stdio: 'inherit', env: process.env });
  process.exit(r.status === null ? 1 : r.status);
}

if (process.exitCode && process.exitCode !== 0) {
  console.error('\nOne or more smoke checks failed.');
  process.exit(process.exitCode);
}

console.log('\nSmoke checks passed. To run a full migration apply, set DATABASE_URL and run:');
console.log('  npm test -- --full');
