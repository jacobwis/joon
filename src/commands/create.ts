import * as path from 'path';
import { writeFile, exists, mkdir } from '../fileUtils';

export const migrationTemplate = `/* UP */\n\n/* DOWN */\n\n`;

export const create = async (name: string) => {
  const migrationsPath = path.resolve(process.cwd(), 'migrations');

  const directoryExists = await exists(migrationsPath);
  if (!directoryExists) {
    await mkdir(migrationsPath);
  }

  await writeFile(`${migrationsPath}/${name}.sql`, migrationTemplate, 'utf8');
};
