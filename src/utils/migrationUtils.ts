import * as path from 'path';
import * as fs from 'fs-extra';
import * as db from '../db';

export const getCompletedMigrations = async () => {
  const { rows } = await db.query(
    'SELECT * FROM migrations ORDER BY run_on DESC'
  );
  return rows.map(row => row.name);
};

export const getPendingMigrations = async () => {
  const migrationsDir = path.resolve(process.cwd(), 'migrations');

  const completedMigrations = await getCompletedMigrations();
  const migrations = await fs.readdir(migrationsDir);

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

export const loadMigrationFile = async (name: string) => {
  const migrationPath = path.resolve(process.cwd(), 'migrations', name);
  return await fs.readFile(migrationPath, 'utf8');
};

export const loadMigration = async (name: string) => {
  const contents = await loadMigrationFile(name);
  return parseMigration(contents);
};

export const migrationUp = async (name: string, sql: string) => {
  await db.query(sql);
  await db.query('INSERT INTO migrations(name, run_on) VALUES($1, $2);', [
    name,
    new Date()
  ]);
};

export const migrationDown = async (name: string, sql: string) => {
  await db.query(sql);
  await db.query('DELETE FROM migrations WHERE name = $1', [name]);
};

export const getRecentMigrations = async (limit: number = 1) => {
  const { rows } = await db.query(
    'SELECT * FROM migrations ORDER BY run_on DESC LIMIT $1;',
    [limit]
  );

  return rows.map(row => row.name);
};

export const getSeedFiles = async () => {
  const seedDir = path.resolve(process.cwd(), 'seeds');
  const files = await fs.readdir(seedDir);
  return files.filter(file => path.extname(file) === '.js').sort((a, b) => {
    const aStats = fs.statSync(`${seedDir}/${a}`);
    const bStats = fs.statSync(`${seedDir}/${b}`);

    return aStats.birthtimeMs - bStats.birthtimeMs;
  });
};
