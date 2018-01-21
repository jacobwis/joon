import * as path from 'path';
import * as fs from 'fs-extra';
import * as db from './db';
import * as utils from './utils/migrationUtils';
import loadConfig from './loadConfig';

export const migrationTemplate = `/* UP */\n\n/* DOWN */\n\n`;

class Joon {
  public static async createInstance(
    env: string = 'development',
    quiet: boolean = false
  ) {
    const config = await loadConfig();

    if (!config[env]) {
      // tslint:disable-next-line:no-console
      console.log(
        `Could not find a configuration object for the ${env} environment`
      );
      return;
    }

    const dbConnection =
      typeof config[env] === 'string'
        ? {
            connectionString: config[env]
          }
        : config[env];

    db.initPool(dbConnection);

    const joon = new Joon();

    if (quiet) {
      joon.shouldLog = false;
    }

    return joon;
  }

  public shouldLog: boolean = true;

  public async create(name: string) {
    const fileName = `${name}.sql`;

    const migrationDir = path.resolve(process.cwd(), 'migrations');
    const filePath = path.resolve(migrationDir, fileName);

    if (!await fs.pathExists(migrationDir)) {
      await fs.mkdirSync(migrationDir);
    }

    await fs.writeFile(filePath, migrationTemplate, 'utf8');
    this.log(`Created ${fileName}`);
  }

  public async up() {
    await db.query(
      'CREATE TABLE IF NOT EXISTS migrations(id serial primary key, name varchar, run_on timestamp without time zone);'
    );
    const migrationsDir = path.resolve(process.cwd(), 'migrations');

    const pendingMigrations = await utils.getPendingMigrations();
    for (const pendingMigration of pendingMigrations) {
      const migration = await utils.loadMigration(pendingMigration);
      await utils.migrationUp(pendingMigration, migration.up);
      this.log(`Executed ${pendingMigration} (up)`);
    }
  }

  public async down(count: number = 1) {
    const recentMigrations = await utils.getRecentMigrations(count);
    for (const migrationName of recentMigrations) {
      const migration = await utils.loadMigration(migrationName);
      await utils.migrationDown(migrationName, migration.down);
      this.log(`Executed ${migrationName} (down)`);
    }
  }

  public async reset() {
    const completedMigrations = await utils.getCompletedMigrations();
    for (const migrationName of completedMigrations) {
      const migration = await utils.loadMigration(migrationName);
      await utils.migrationDown(migrationName, migration.down);
      this.log(`Executed ${migrationName} (down)`);
    }
  }

  public async end() {
    await db.pool.end();
  }

  public async seed() {
    const seedDir = path.resolve(process.cwd(), 'seeds');
    const seedFiles = await utils.getSeedFiles();
    for (const seedFile of seedFiles) {
      this.log(`Running ${seedFile}`);
      const seedfn = require(`${seedDir}/${seedFile}`);
      await seedfn(db);
    }
  }

  public log(message: string) {
    if (this.shouldLog) {
      // tslint:disable-next-line:no-console
      console.log(message);
    }
  }
}

export default Joon;
