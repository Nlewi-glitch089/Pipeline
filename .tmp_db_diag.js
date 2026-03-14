const fs = require('fs');
const s = fs.existsSync('.env') ? fs.readFileSync('.env','utf8') : process.env.DATABASE_URL || '';
const line = (s.split(/\r?\n/).find(l=>l.startsWith('DATABASE_URL=')) || s);
if(!line){ console.error('no DATABASE_URL'); process.exit(1); }
const db = line.includes('=') ? line.slice(line.indexOf('=')+1) : line;
const { Client } = require('pg');
(async()=>{
  const c = new Client({ connectionString: db });
  try {
    await c.connect();
    console.log('Connected OK');
    const t = await c.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
    console.log('TABLES:\n', t.rows.map(r=>r.table_name).join('\n') || '<none>');
    const cols = await c.query("SELECT table_name,column_name,data_type,udt_name FROM information_schema.columns WHERE table_schema='public' AND (column_name ILIKE '%id%' OR column_name ILIKE '%email%') ORDER BY table_name,ordinal_position");
    console.log('COLUMNS (id/email):\n', JSON.stringify(cols.rows, null, 2));
    try {
      const prep = await c.query('SELECT name,statement FROM pg_prepared_statements');
      console.log('PREPARED ROWS:', prep.rows.length); prep.rows.slice(0,10).forEach(r=>console.log('-',r.name));
    } catch(e) { console.log('PREPARED-ERR', String(e)); }
    try {
      const act = await c.query("SELECT pid,usename,application_name,state,substr(query,1,200) as q FROM pg_stat_activity WHERE datname=current_database() ORDER BY pid DESC LIMIT 20");
      console.log('ACTIVITY ROWS:', act.rows.length);
      act.rows.forEach(r=>console.log(r.pid,r.usename,r.application_name,r.state,r.q));
    } catch(e) { console.log('ACTIVITY-ERR', String(e)); }
  } catch(e) { console.error('ERROR', e); process.exit(1); } finally { await c.end(); process.exit(0); }
})();
