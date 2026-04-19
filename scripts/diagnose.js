/**
 * M.O.C.H.I. LABO — System Diagnostic Tool
 * 
 * Usage: node scripts/diagnose.js <password>
 * 
 * このスクリプトは、Vercel上のシステムの健康状態を確認し、
 * Antigravity（AI）が即座にトラブルを発見するためのレポートを生成します。
 */

const https = require('https');

const password = process.argv[2];
if (!password) {
  console.error('Error: Password is required. Usage: node scripts/diagnose.js <password>');
  process.exit(1);
}

const url = 'https://lab.mochisura-lab.com/api/health-check';

console.log('--- M.O.C.H.I. LABO: Diagnostic Logic Initiated ---');
console.log(`Target: ${url}`);
console.log('Checking system integrity...');

const options = {
  headers: {
    'Authorization': `Bearer ${password}`
  }
};

https.get(url, options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 401) {
      console.error('❌ Authentication Failed (401). Please check the BROADCAST_SECRET.');
      return;
    }

    if (res.statusCode !== 200) {
      console.error(`❌ System Error (${res.statusCode}): ${data}`);
      return;
    }

    try {
      const report = JSON.parse(data);
      console.log('\n--- Diagnostic Result ---');
      console.log(`Status: ${report.status === 'Healthy' ? '✅ Healthy' : '⚠️ ' + report.status}`);
      console.log(`Timestamp: ${report.timestamp}`);
      
      console.log('\n[Reports]');
      report.reports.forEach(r => {
        const icon = r.level === 'Info' ? 'ℹ️' : r.level === 'Warning' ? '⚠️' : '❌';
        console.log(`${icon} [${r.component}] ${r.message}`);
      });

      console.log('\n[Antigravity Insight]');
      console.log(`💡 ${report.antigravity_hint}`);
      
    } catch (e) {
      console.error('❌ Failed to parse response data:', e.message);
      console.log('Raw data:', data);
    }
  });

}).on('error', (err) => {
  console.error('❌ Network Error:', err.message);
});
