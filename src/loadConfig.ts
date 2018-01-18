import * as path from 'path';
import { readFile } from './fileUtils';

const loadConfig = async () => {
  const configPath = path.resolve(process.cwd(), 'joonConfig.json');
  const contents = await readFile(configPath, { encoding: 'utf8' });
  return JSON.parse(contents);
};

export default loadConfig;
