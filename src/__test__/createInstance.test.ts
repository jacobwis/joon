import * as db from '../db';
import * as mock from 'mock-fs';
import createInstance from '../createInstance';

describe('createInstance', () => {
  beforeAll(() => {
    mock({
      'joonConfig.json':
        '{ "development": "posgresql://jacobwisniewski@localhost/joon_test" }'
    });
  });

  afterAll(() => {
    mock.restore();
  });

  afterEach(async () => {
    await db.endPool();
  });

  it('return an object containing the joonConfig.json file', async () => {
    const joon = await createInstance();
    expect(joon.config).toEqual({
      development: 'posgresql://jacobwisniewski@localhost/joon_test'
    });
  });

  it('should initialize a pool', async () => {
    expect(db.pool).toBeUndefined();
    const joon = await createInstance();
    expect(db.pool).toBeDefined();
  });

  it('should expose the "up" method', async () => {
    const joon = await createInstance();
    expect(joon.up).toBeDefined();
  });
});
