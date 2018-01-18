import * as migrationUtils from '../utils/migrationUtils';

const down = async (count: number = 1) => {
  const recentMigrations = await migrationUtils.getRecentMigrations(count);
  for (const migrationName of recentMigrations) {
    const contents = await migrationUtils.loadMigrationFile(migrationName);
    const migration = await migrationUtils.parseMigration(contents);
    await migrationUtils.migrationDown(migrationName, migration.down);
  }
};

export default down;
