const { spawn } = require('child_process');
const fs = require('fs');
fs.writeFileSync('out.txt', '');
const child = spawn('npm.cmd', ['run', 'dev'], { cwd: __dirname, shell: true });
child.stdout.on('data', d => fs.appendFileSync('out.txt', d.toString()));
child.stderr.on('data', d => fs.appendFileSync('out.txt', d.toString()));
child.on('close', code => fs.appendFileSync('out.txt', '\nEXIT CODE: ' + code));
