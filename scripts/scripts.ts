// 1

var result = ['super', '20.5', 'test', '23'].map((el) => (isNaN(+el) ? el : +el));
console.log(result);

// 2

import * as fs from 'fs';
import * as path from 'path';

function readDirectory(dir: string): string[] {
  let filePaths: string[] = [];
  let fileNames = fs.readdirSync(dir);
  fileNames.forEach(filename => {
    const ext = path.parse(filename).ext;
    const filepath = path.resolve(dir, filename);
    const stat = fs.lstatSync(filepath);

    if (stat.isFile() && ext === '.csv') {
      filePaths.push(filepath);
    }
  });

  return filePaths;
}

console.log(readDirectory(__dirname + "/../files"));

// 3
console.log(/\d/.test("test-string"));
console.log(/\d/.test("test-string23"));
