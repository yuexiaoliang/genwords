import xlsx from 'node-xlsx';
import fs from 'fs-extra';
import rimraf from 'rimraf';
import path from 'path';
import url from 'url';
import logger from './utils/logger.mjs';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, 'dict');
const encoding = 'utf-8';
const outDir = path.resolve(__dirname, 'data');

const dbPath = path.resolve(outDir, `database.json`);
const db = {};

start();

function createData(line) {
  let [word, DJ = '', KK = '', paraphrase] = line;

  word = handleWord(word);
  if (!word) return;

  paraphrase = handleParaphrase(word, paraphrase);
  if (!paraphrase) return;

  handleDB(word, [1, DJ, KK, paraphrase]);

  if (!fs.existsSync(dbPath)) {
    try {
      fs.createFileSync(dbPath);
    } catch (error) {
      logger.error('database 创建失败', error.toString());
    }
  }

  try {
    fs.writeFileSync(dbPath, JSON.stringify(db), { encoding });
  } catch (error) {
    logger.error('database 写入失败', error.toString());
  }
}

// 处理数据库
function handleDB(word, data) {
  if (!db[word]) {
    // [出现次数，英音，美音，释义]
    db[word] = data;
  } else {
    db[word][0] += 1;
  }
}

// 处理单词
function handleWord(word) {
  word = word.trim().toLocaleLowerCase();

  // 单词不存在则退出
  if (typeof word !== 'string' || word.length < 2) return;

  // 如果单词第一个字符不是字母则退出
  if (word[0].search(/[^a-zA-Z]/) > -1) return;

  return word;
}

// 处理释义
function handleParaphrase(word, para) {
  // 没有释义则退出
  if (typeof para !== 'string') return;

  para = para.split('\n') || [];
  para = para.filter((text) => {
    const t = text.trim();

    if (typeof t !== 'string') return false;
    if (t.length === 0) return false;
    if (t === '无') return false;

    return true;
  });

  // 没有释义则退出
  if (!para.length) return;

  // 如果数据库总已经有这个单词，则合并释义
  if (db[word]) {
    para = Array.from(new Set(para.concat(db[word][3])));
  }

  return para;
}

// 读取 xlsx
function readXlsx(filepath) {
  const sheets = xlsx.parse(filepath);

  sheets.forEach((sheet) => {
    const { data } = sheet;

    data.forEach((line, index) => {
      if (index === 0) return;

      createData(line);
    });
  });

  const msg = `【${filepath}】 统计完毕`;
  logger.info(msg);
}

// 读取目录
function readdir(dirname) {
  const direntArr = fs.readdirSync(dirname, { withFileTypes: true });
  direntArr.forEach((dirent) => {
    const _path = path.resolve(dirname, dirent.name);

    if (dirent.isDirectory()) {
      readdir(_path);
    }

    if (dirent.isFile()) {
      if (['.xlsx', '.xls', '.csv'].includes(path.extname(_path))) {
        readXlsx(_path);
      }
    }
  });
}

function start() {
  rimraf.rimrafSync(outDir);
  readdir(root);
  logger.info('完成了！！！');
}
