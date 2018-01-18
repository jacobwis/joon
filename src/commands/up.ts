import * as fs from 'fs';
import { promisify } from 'util';
import * as path from 'path';
import {
  getPendingMigrations,
  parseMigration,
  loadMigrationFile
} from './../utils/migrationUtils';
import * as db from '../db';

const readFile = promisify(fs.readFile);

const up = async () => {
  const migrationsDir = path.resolve(process.cwd(), 'migrations');

  const pendingMigrations = await getPendingMigrations();
  for (const pendingMigration of pendingMigrations) {
    const contents = await loadMigrationFile(pendingMigration);
    const migration = parseMigration(contents);
    await db.query(migration.up);
    await db.query('INSERT INTO migrations(name, run_on) VALUES($1, $2);', [
      pendingMigration,
      new Date()
    ]);
  }
};

export default up;
