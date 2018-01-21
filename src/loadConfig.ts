import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs-extra';
import { promisify } from 'util';

const loadConfig = async () => {
  const dotEnvExists = await fs.pathExists('.env');

  if (dotEnvExists) {
    dotenv.config();
  }

  const configPath = path.resolve(process.cwd(), 'joonConfig.json');

  const contents = await fs.readFile(configPath, 'utf8');
  const config = JSON.parse(contents);

  for (const key in config) {
    if (config.hasOwnProperty(key)) {
      const element = config[key];
      if (typeof element === 'object' && element.ENV) {
        config[key] = process.env[element.ENV];
      }
    }
  }

  console.log(config);

  return config;
};

export default loadConfig;
