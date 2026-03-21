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
  path.join(__dirname, 'manuva-admin', 'app'),
  path.join(__dirname, 'manuva-admin', 'components'),
  path.join(__dirname, 'manuva-frontend', 'app'),
  path.join(__dirname, 'manuva-frontend', 'components')
];

let filesModified = 0;

targetDirs.forEach(dir => {
  walk(dir, file => {
    if (file.endsWith('.jsx') || file.endsWith('.js')) {
      let content = fs.readFileSync(file, 'utf8');
      
      // Update primary dark buttons to Terracotta
      let newContent = content
        .replace(/bg-slate-800 text-white(.*?)hover:bg-slate-900/g, 'bg-primary text-primary-foreground$1hover:bg-accent hover:text-accent-foreground')
        .replace(/bg-slate-700 text-white(.*?)hover:bg-slate-900/g, 'bg-primary text-primary-foreground$1hover:bg-accent hover:text-accent-foreground')
        // Frontend specific
        .replace(/bg-black text-white/g, 'bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground')
        // General text color from harsh slate to charcoal
        .replace(/text-slate-800/g, 'text-foreground')
        .replace(/text-slate-900/g, 'text-foreground')
        .replace(/text-gray-900/g, 'text-foreground')
        // Card backgrounds from white to beige
        .replace(/bg-white rounded-2xl shadow-xl border border-slate-100/g, 'bg-surface text-surface-foreground rounded-2xl shadow-xl border border-border')
        .replace(/bg-white rounded-xl shadow-sm border border-slate-200/g, 'bg-surface text-surface-foreground rounded-xl shadow-sm border border-border');

      if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        filesModified++;
        console.log(`Updated buttons/cards in ${file}`);
      }
    }
  });
});

console.log(`Finished modifying ${filesModified} files.`);
