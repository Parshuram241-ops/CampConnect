const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const colorMap = {
  'dark:bg-[#0f172a]': 'dark:bg-slate-800',
  'dark:bg-slate-900': 'dark:bg-slate-800',
  'dark:bg-slate-800': 'dark:bg-slate-700',
  'dark:bg-[#0a0f1c]': 'dark:bg-slate-900'
};

let changedFiles = 0;

walkDir('d:/CampConnect/src', function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace colors simultaneously
    content = content.replace(/dark:bg-\[\#0f172a\]|dark:bg-slate-900|dark:bg-slate-800|dark:bg-\[\#0a0f1c\]/g, match => colorMap[match] || match);
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log("Updated: " + filePath);
      changedFiles++;
    }
  }
});

console.log("Done! Updated " + changedFiles + " files with lighter dark mode classes.");
