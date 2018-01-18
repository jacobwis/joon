import * as migrationUtils from '../utils/migrationUtils';

const down = async (count: number = 1) => {
  const recentMigrations = await migrationUtils.getRecentMigrations(count);
  for (const migrationName of recentMigrations) {
    const migration = await migrationUtils.loadMigration(migrationName);
    await migrationUtils.migrationDown(migrationName, migration.down);
  }
};

export default down;
