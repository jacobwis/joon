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
    const tableExistsBefore = await utils.tableExists('migrations');
    expect(tableExistsBefore).toEqual(true);

    await utils.dropTables();

    const tableExistsAfter = await utils.tableExists('migrations');
    expect(tableExistsAfter).toEqual(false);
  });
});

describe('createTables', () => {
  beforeAll(async () => {
    await utils.dropTables();
  });

  it('should create the migration table', async () => {
    const tableExistsBefore = await utils.tableExists('migrations');
    expect(tableExistsBefore).toEqual(false);

    await utils.createTables();

    const tableExistsAfter = await utils.tableExists('migrations');
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

describe('tableExists', () => {
  beforeAll(async () => {
    await utils.setupTestDB();
  });

  it('should return true when a table with the name provided exists', async () => {
    const exists = await utils.tableExists('migrations');
    expect(exists).toEqual(true);
  });

  it('should return false when a table with the name provided does not exist', async () => {
    const exists = await utils.tableExists('random_table_name');
    expect(exists).toEqual(false);
  });
});
