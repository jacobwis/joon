import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import * as db from '../db';

const readdir = promisify(fs.readdir);

export const getCompletedMigrations = async () => {
  const { rows } = await db.query('SELECT * FROM migrations');
  return rows.map(row => row.name);
};

export const getPendingMigrations = async () => {
  const migrationsDir = path.resolve(process.cwd(), 'migrations');

  const completedMigrations = await getCompletedMigrations();
  const migrations = await readdir(migrationsDir);

  return migrations.filter(migration => {
    if (path.extname(migration) !== '.sql') {
      return false;
    }

    return completedMigrations.indexOf(migration) === -1;
  });
};

export const parseMigration = (contents: string) => {
  const START_TOKEN = '/* UP */';
  const DOWN_TOKEN = '/* DOWN */';

  const up = contents.substring(
    contents.indexOf(START_TOKEN) + START_TOKEN.length,
    contents.indexOf(DOWN_TOKEN)
  );

  const down = contents.substring(
    contents.indexOf(DOWN_TOKEN) + DOWN_TOKEN.length
  );

  return {
    up: formatSQL(up),
    down: formatSQL(down)
  };
};

export const formatSQL = (contents: string) => {
  return contents
    .trim()
    .split('\n')
    .map(line => line.trim())
    .join(' ')
    .replace('( ', '(')
    .replace(' )', ')');
};
