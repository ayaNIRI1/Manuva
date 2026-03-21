const fs = require('fs');
const path = require('path');

const frontendGlobals = path.join(__dirname, 'manuva-frontend', 'app', 'globals.css');
const adminGlobals = path.join(__dirname, 'manuva-admin', 'app', 'globals.css');

const themeVariables = `
@theme {
  --color-navy: #243447;
  --color-gold: #c9a227;
  --color-cream: #fffdf7;
  --color-beige: #efe6da;
  --color-charcoal: #1a1a1a;
  --color-terracotta: #c96a4a;
}
`;

function injectTheme(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('--color-navy: #243447;')) {
    // Insert after @import "tailwindcss";
    content = content.replace('@import "tailwindcss";', '@import "tailwindcss";\n' + themeVariables);
    
    // Also update existing HSL variables if needed, or leave them. For now just inject new variables.
    // Replace default body background/color to use the new theme
    content = content.replace(/--background: 0 0% 100%;/g, '--background: 45 100% 98%;');
    content = content.replace(/--foreground: 0 0% 0%;/g, '--foreground: 0 0% 10%;');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated theme in ${filePath}`);
  }
}

injectTheme(frontendGlobals);
injectTheme(adminGlobals);

console.log('Done injecting themes.');
