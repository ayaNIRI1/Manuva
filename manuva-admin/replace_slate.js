const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const targetDirs = [
  path.join(__dirname, 'app'),
  path.join(__dirname, 'components')
];

let filesModified = 0;

targetDirs.forEach(dir => {
  walk(dir, file => {
    if (file.endsWith('.jsx') || file.endsWith('.js')) {
      let content = fs.readFileSync(file, 'utf8');
      let newContent = content
        .replace(/text-slate-400/g, 'text-slate-600')
        .replace(/text-slate-500/g, 'text-slate-700');
      
      if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        filesModified++;
        console.log(`Updated ${file}`);
      }
    }
  });
});

console.log(`Finished modifying ${filesModified} files.`);
