const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const dist = path.join(__dirname, 'dist');
if (fs.existsSync(dist)) {
  fs.rmSync(dist, { recursive: true, force: true });
}
fs.mkdirSync(dist, { recursive: true });

fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(dist, 'index.html'));
fs.copyFileSync(path.join(__dirname, 'cases_data.js'), path.join(dist, 'cases_data.js'));
copyDir(path.join(__dirname, 'cases'), path.join(dist, 'cases'));

console.log('Build complete! dist/ contents:', fs.readdirSync(dist));
console.log('dist/cases contains:', fs.readdirSync(path.join(dist, 'cases')).length, 'cases');
