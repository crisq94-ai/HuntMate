import { spawn } from 'node:child_process';

const port = Number(process.env.PORT || 10000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT musi być prawidłowym numerem portu.');
}
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start',
  '--hostname', '0.0.0.0', '--port', String(port)], {
  stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' }
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
child.on('error', error => { console.error(error); process.exit(1); });
child.on('exit', code => process.exit(code ?? 0));
