import {
  getCompletedMigrations,
  loadMigration,
  migrationDown
} from '../utils/migrationUtils';

const reset = async () => {
  const completedMigrations = await getCompletedMigrations();
  for (const migrationName of completedMigrations) {
    const migration = await loadMigration(migrationName);
    await migrationDown(migrationName, migration.down);
  }
};

export default reset;
