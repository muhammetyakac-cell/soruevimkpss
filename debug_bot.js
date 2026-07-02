const fs = require('fs');

const content = fs.readFileSync('testler/cografya/cografya-105.md', 'utf8');

// 1. Cevap Anahtarı
const answerRegex = /\|\s*(\d+)\s*\|\s*([A-E])\s*\|/g;
const answers = {};
let match;
while ((match = answerRegex.exec(content)) !== null) {
  answers[match[1]] = match[2];
}
console.log("Answers extracted:", answers);

// 2. Sorular
const questionBlocks = content.split(/\*\*Soru \d+:\*\*|Soru \d+:/).slice(1);
console.log(`Found ${questionBlocks.length} question blocks.`);

let qIndex = 1;
for (const block of questionBlocks) {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let questionText = '';
  let options = [];
  
  for (const line of lines) {
    if (/^[A-E]\)/.test(line)) {
      options.push(line);
    } else if (line === '---' || line.startsWith('##')) {
      break;
    } else if (options.length === 0) {
      questionText += (questionText ? ' ' : '') + line;
    }
  }

  const qNumberStr = qIndex.toString();
  const correctLetter = answers[qNumberStr];

  console.log(`\nSoru ${qIndex}:`);
  console.log(`Text: ${questionText}`);
  console.log(`Options: ${options.length} options found`);
  console.log(`Correct Answer from table: ${correctLetter}`);

  if (questionText && options.length > 0 && correctLetter) {
    console.log("=> Valid for insertion");
  } else {
    console.log("=> INVALID!");
  }
  
  qIndex++;
}
