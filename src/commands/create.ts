import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);

export const migrationTemplate = `/* UP */\n\n/* DOWN */\n\n`;

const create = async (name: string) => {
  const migrationDir = path.resolve(process.cwd(), 'migrations');
  const filePath = path.resolve(migrationDir, `${name}.sql`);

  if (!await exists(migrationDir)) {
    await mkdir(migrationDir);
  }

  await writeFile(filePath, migrationTemplate, 'utf8');
};

export default create;
