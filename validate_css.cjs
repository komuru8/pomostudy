const fs = require('fs');

const filePath = process.argv[2];
if (!filePath) {
    console.error("Please provide a file path");
    process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

let stack = [];
let inComment = false;

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    for (let j = 0; j < line.length; j++) {
        // Handle Comments /* ... */
        if (inComment) {
            if (line[j] === '*' && line[j + 1] === '/') {
                inComment = false;
                j++;
            }
            continue;
        }

        if (line[j] === '/' && line[j + 1] === '*') {
            inComment = true;
            j++;
            continue;
        }

        // Check Braces
        if (line[j] === '{') {
            stack.push({ line: i + 1, char: j + 1 });
        } else if (line[j] === '}') {
            if (stack.length === 0) {
                console.error(`ERROR: Unexpected '}' at Line ${i + 1}:${j + 1}`);
                console.log(`Context: ${line.trim()}`);
                process.exit(1);
            }
            stack.pop();
        }
    }
}

if (stack.length > 0) {
    const last = stack[stack.length - 1];
    console.error(`ERROR: Unclosed '{' at Line ${last.line}:${last.char}`);
    process.exit(1);
}

console.log("CSS Brace Syntax OK");
