import * as testUtils from '../../../test/utils';
import * as db from '../../db';
import { getCompletedMigrations } from '../migrationUtils';

beforeAll(() => {
  db.initPool({
    connectionString: 'posgresql://jacobwisniewski@localhost/joon_test'
  });
});

afterAll(async () => {
  await Promise.all([testUtils.endPool(), db.endPool()]);
});

describe('getCompletedMigrations', () => {
  beforeAll(async () => {
    await testUtils.setupTestDB();
  });

  it('should return an array of all migrations from the database', async () => {
    const migrations = await getCompletedMigrations();
    expect(migrations).toEqual(['CreateUserTable.sql', 'CreatePostTable.sql']);
  });
});
