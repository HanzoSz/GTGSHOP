import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('./src/app', function(filePath) {
    if (!filePath.endsWith('.tsx')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let dirty = false;

    // Thay thế regex 1 dòng
    const regex1 = /if\s*\((imageUrl|url)\.startsWith\('http:\/\/'\)\s*\|\|\s*\1\.startsWith\('https:\/\/'\)\)\s*return\s*\1;/g;
    if (regex1.test(content)) {
        content = content.replace(regex1, (match, p1) => {
            return `if (${p1}.startsWith('http')) { if (${p1}.includes('localhost')) { try { return \`\${IMAGE_BASE_URL}/\${new URL(${p1}).pathname.replace(/^\\/+/, '')}\`; } catch(e){} } return ${p1}; }`;
        });
        dirty = true;
    }

    // Thay thế regex block nhiều dòng
    const regex3 = /if\s*\((imageUrl|url)\.startsWith\('http\S*'\)(?:\s*\|\|\s*\1\.startsWith\('http\S*'\))?\)\s*\{\s*return\s*\1;\s*\}/g;
    if (regex3.test(content)) {
        content = content.replace(regex3, (match, p1) => {
            return `if (${p1}.startsWith('http')) { if (${p1}.includes('localhost')) { try { return \`\${IMAGE_BASE_URL}/\${new URL(${p1}).pathname.replace(/^\\/+/, '')}\`; } catch(e){} } return ${p1}; }`;
        });
        dirty = true;
    }

    // Replace the simple 1 line missing `{}`
    const regex2 = /if\s*\((imageUrl|url)\.startsWith\('http'\)\)\s*return\s*\1;/g;
    if (regex2.test(content)) {
        content = content.replace(regex2, (match, p1) => {
            return `if (${p1}.startsWith('http')) { if (${p1}.includes('localhost')) { try { return \`\${IMAGE_BASE_URL}/\${new URL(${p1}).pathname.replace(/^\\/+/, '')}\`; } catch{} } return ${p1}; }`;
        });
        dirty = true;
    }

    if (dirty) {
        fs.writeFileSync(filePath, content);
        console.log('Fixed:', filePath);
    }
});
