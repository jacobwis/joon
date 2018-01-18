import * as fs from 'fs';
import { promisify } from 'util';
import * as path from 'path';
import {
  getPendingMigrations,
  loadMigration,
  migrationUp
} from './../utils/migrationUtils';
import * as db from '../db';

const readFile = promisify(fs.readFile);

const up = async () => {
  await db.query(
    'CREATE TABLE IF NOT EXISTS migrations(id serial primary key, name varchar, run_on timestamp without time zone);'
  );
  const migrationsDir = path.resolve(process.cwd(), 'migrations');

  const pendingMigrations = await getPendingMigrations();
  for (const pendingMigration of pendingMigrations) {
    const migration = await loadMigration(pendingMigration);
    await migrationUp(pendingMigration, migration.up);
  }
};

export default up;
