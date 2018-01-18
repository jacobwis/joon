const sinon = require('sinon');
const utils = require('../utils');
const db = require('../db');

afterAll(async () => {
  await db.pool.end();
});

describe('dropTables', () => {
  beforeAll(async () => {
    await utils.createTables();
  });

  it('should drop the migration table', async () => {
    let res = await db.query("SELECT to_regclass('migrations');");
    const tableExistsBefore =
      res.rows[0].to_regclass === 'migrations' ? true : false;
    expect(tableExistsBefore).toEqual(true);

    await utils.dropTables();

    res = await db.query("SELECT to_regclass('migrations');");
    const tableExistsAfter =
      res.rows[0].to_regclass === 'migrations' ? true : false;
    expect(tableExistsAfter).toEqual(false);
  });
});

describe('createTables', () => {
  beforeAll(async () => {
    await utils.dropTables();
  });

  it('should create the migration table', async () => {
    let res = await db.query("SELECT to_regclass('migrations');");
    const tableExistsBefore =
      res.rows[0].to_regclass === 'migrations' ? true : false;
    expect(tableExistsBefore).toEqual(false);

    await utils.createTables();

    res = await db.query("SELECT to_regclass('migrations');");
    const tableExistsAfter =
      res.rows[0].to_regclass === 'migrations' ? true : false;
    expect(tableExistsAfter).toEqual(true);
  });
});

describe('resetDB', () => {
  const sandbox = sinon.createSandbox();
  let createTableSpy;
  let dropTableSpy;
  beforeEach(async () => {
    createTableSpy = sandbox.spy(utils, 'createTables');
    dropTableSpy = sandbox.spy(utils, 'dropTables');
  });

  afterEach(async () => {
    sandbox.restore();
  });

  it('should call dropTables and createTables', async () => {
    await utils.resetDB();
    expect(createTableSpy.callCount).toEqual(1);
    expect(dropTableSpy.callCount).toEqual(1);
  });
});

describe('seedDB', () => {
  beforeAll(async () => {
    await utils.resetDB();
    await utils.seedDB();
  });

  it('should have inserted the correct migration data', async () => {
    const { rows } = await db.query('SELECT id, name FROM migrations');
    expect(rows).toEqual([
      { id: 1, name: 'CreateUserTable.sql' },
      { id: 2, name: 'CreatePostTable.sql' }
    ]);
  });
});

describe('setupTestDB', () => {
  const sandbox = sinon.createSandbox();
  let resetDBSpy;
  let seedDBSpy;
  beforeAll(async () => {
    resetDBSpy = sandbox.spy(utils, 'resetDB');
    seedDBSpy = sandbox.spy(utils, 'seedDB');
    await utils.setupTestDB();
  });

  afterAll(() => {
    sandbox.restore();
  });

  it('should call resetDB', () => {
    expect(resetDBSpy.callCount).toEqual(1);
  });

  it('should call seedDB', () => {
    expect(seedDBSpy.callCount).toEqual(1);
  });
});