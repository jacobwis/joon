import * as path from 'path';
import * as fs from 'fs-extra';
import { promisify } from 'util';

const loadConfig = async () => {
  const configPath = path.resolve(process.cwd(), 'joonConfig.json');

  const contents = await fs.readFile(configPath, 'utf8');

  return JSON.parse(contents);
};

export default loadConfig;
