import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

const loadConfig = async () => {
  const configPath = path.resolve(process.cwd(), 'joonConfig.json');

  const contents = await readFile(configPath, 'utf8');

  return JSON.parse(contents);
};

export default loadConfig;
