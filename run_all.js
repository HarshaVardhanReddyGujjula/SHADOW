const { spawn } = require('child_process');
const path = require('path');

console.log('=====================================================');
console.log('🚀 SHADOW FULL STACK - STARTING ALL SERVICES...');
console.log('=====================================================');

const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');
const pythonExe = path.join(backendDir, 'venv', 'Scripts', 'python.exe');

// 1. Start FastAPI Backend
console.log('⚡ [1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...');
const backend = spawn(pythonExe, ['-m', 'uvicorn', 'main:app', '--reload', '--host', '127.0.0.1', '--port', '8000'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true
});

// 2. Start Vite Frontend
console.log('🌐 [2/3] Starting React Vite Frontend on http://localhost:5173 ...');
const frontend = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: true
});

// 3. Start Telemetry Simulator
console.log('📡 [3/3] Starting Real-Time Telemetry Simulator...');
setTimeout(() => {
  const simulator = spawn(pythonExe, ['simulator.py'], {
    cwd: backendDir,
    stdio: 'inherit',
    shell: true
  });

  simulator.on('close', (code) => {
    console.log(`[Simulator exited with code ${code}]`);
  });
}, 3000);

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down SHADOW services...');
  backend.kill();
  frontend.kill();
  process.exit();
});
