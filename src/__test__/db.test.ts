import * as db from '../db';

afterAll(async () => {
  await db.endPool();
});

describe('db.pool', () => {
  it('should be undefined by default', () => {
    expect(db.pool).toBeUndefined();
  });
});

describe('initPool', () => {
  afterEach(async () => {
    await db.endPool();
  });

  it('should create a pool', () => {
    db.initPool({
      connectionString: 'postgresql://jacobwisniewski@localhost/joon_test'
    });

    expect(db.pool).toBeDefined();
  });

  it('should not recreate a pool if one already exists', () => {
    // Ensure pool does not already exist
    expect(db.pool).toBeUndefined();

    db.initPool({
      connectionString: 'postgresql://jacobwisniewski@localhost/joon_test'
    });
    const p1 = db.pool;

    db.initPool({
      connectionString: 'postgresql://jacobwisniewski@localhost/joon_test'
    });

    expect(db.pool).toBe(p1);
  });
});
