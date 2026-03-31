import fs from 'fs';
import path from 'path';

const includeExts = ['.jsx', '.js', '.ts', '.tsx', '.css', '.env', '.json'];
const excludeFolders = ['node_modules', '.git', 'dist', 'build'];
const excludeFiles = ['package-lock.json', 'yarn.lock'];

let totalFiles = 0;
let dump = "";

function walk(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const relPath = path.relative('.', fullPath).replace(/\\/g, '/');
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!excludeFolders.includes(item)) {
                walk(fullPath);
            }
        } else {
            if (excludeFiles.includes(item)) continue;
            
            const ext = path.extname(item);
            if (includeExts.includes(ext) || item === '.env' || includeExts.some(e => item.endsWith(e))) {
                
                let content = "";
                // Treat the giant generated mockData as binary to avoid exceeding 16000 token limit
                if (item === 'mockData.js' && stat.size > 50000) {
                    content = "[BINARY FILE - SKIPPED]";
                } else {
                    content = fs.readFileSync(fullPath, 'utf8');
                }

                dump += `### FILE: ${relPath}\n${content}\n\n`;
                totalFiles++;
            }
        }
    }
}

walk('.');

const pkgStr = fs.readFileSync('package.json', 'utf8');
const pkg = JSON.parse(pkgStr);
const deps = Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.devDependencies || {}));

dump += `### PROJECT METADATA
- Total files included: ${totalFiles}
- Framework: React (Vite)
- Package manager: npm
- All dependencies from package.json: ${deps.join(', ')}
- All .env variable NAMES (not values): NONE

ANALYSIS START
`;

fs.writeFileSync('dump.txt', dump);
console.log("Dump generated.");
