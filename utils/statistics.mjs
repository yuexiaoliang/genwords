import fs from 'fs-extra';
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = fs.readJSONSync(path.resolve(__dirname, '../data/database.json'));
const entries = Object.entries(data);
const total = entries.length;
const worked = entries
  .sort((a, b) => {
    return b[1][0] - a[1][0];
  })
  .map((arr) => [arr[0], arr[1][0]]);

fs.writeJSONSync(path.resolve(__dirname, 'data.json'), { worked, total });
