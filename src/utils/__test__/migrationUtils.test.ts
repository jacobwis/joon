import * as mock from 'mock-fs';
import * as testUtils from '../../../test/utils';
import * as db from '../../db';
import {
  getCompletedMigrations,
  getPendingMigrations,
  parseMigration,
  formatSQL,
  loadMigrationFile,
  migrationUp,
  migrationDown,
  getRecentMigrations,
  loadMigration,
  getSeedFiles
} from '../migrationUtils';

beforeAll(() => {
  db.initPool({
    connectionString: 'postgresql://jacobwisniewski@localhost/joon_test'
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

describe('getPendingMigrations', () => {
  let pendingMigrations;

  beforeAll(async () => {
    await testUtils.setupTestDB();

    mock({
      migrations: {
        'CreateUserTable.sql': '',
        'CreatePostTable.sql': '',
        'CreateUpvoteTable.sql': mock.file({
          content: '',
          birthtime: new Date(1),
          ctime: new Date(1),
          mtime: new Date(1)
        }),
        'CreateBookTable.sql': '',
        'randomFile.js': ''
      }
    });

    pendingMigrations = await getPendingMigrations();
  });

  afterAll(() => {
    mock.restore();
  });

  it('should include migrations from the migrations directory that are not in the migrations table', () => {
    expect(pendingMigrations).toContainEqual('CreateBookTable.sql');
    expect(pendingMigrations).toContainEqual('CreateUpvoteTable.sql');
  });

  it('should not include migrations that are in the migrations table', () => {
    expect(pendingMigrations).not.toContainEqual('CreateUserTable.sql');
    expect(pendingMigrations).not.toContainEqual('CreatePostTable.sql');
  });

  it('should not include any files that are not .sql files', () => {
    expect(pendingMigrations).not.toContainEqual('randomFile.js');
  });

  it('should the files in order that they were created', () => {
    expect(pendingMigrations).toEqual([
      'CreateUpvoteTable.sql',
      'CreateBookTable.sql'
    ]);
  });
});

describe('parseMigration', () => {
  const testMigration = `
  /* UP */
  create table posts(
    id serial primary key,
    content varchar
  );
  /* DOWN */
  drop table posts;
  `;

  it("should return the correct 'up' value", () => {
    const { up } = parseMigration(testMigration);
    expect(up).toEqual(
      'create table posts(id serial primary key, content varchar);'
    );
  });

  it("should return the correct 'down' value", () => {
    const { down } = parseMigration(testMigration);
    expect(down).toEqual('drop table posts;');
  });
});

describe('formatSQL', () => {
  it('should correctly format a raw SQL string', () => {
    const sql = `
    create table posts(
      id serial primary key,
      content varchar
    );    
    `;

    expect(formatSQL(sql)).toEqual(
      'create table posts(id serial primary key, content varchar);'
    );
  });
});

describe('loadMigrationFile', () => {
  beforeAll(async () => {
    await testUtils.setupTestDB();

    mock({
      migrations: {
        'CreateUserTable.sql': `
          /* UP */
          create table users(
            id serial primary key,
            name varchar
          );
          /* DOWN */
          drop table users;        
        `,
        'CreatePostTable.sql': `
          /* UP */
          create table posts(
            id serial primary key,
            title varchar,
            content varchar
          );
          /* DOWN */
          drop table posts;           
        `,
        'CreateBookTable.sql': `
        /* UP */
          create table books(
            id serial primary key,
            title varchar,
            author varchar
          );
          /* DOWN */
          drop table books;           
        `,
        'CreateUpvoteTable.sql': `
          /* UP */
          create table upvotes(
            id serial primary key,
            post_id integer,
            user_id integer
          );
          /* DOWN */
          drop table upvotes;           
        `
      }
    });
  });

  afterAll(() => {
    mock.restore();
  });

  it('should load the file specified', async () => {
    const contents = await loadMigrationFile('CreateUpvoteTable.sql');
    expect(contents).toMatch(`
          /* UP */
          create table upvotes(
            id serial primary key,
            post_id integer,
            user_id integer
          );
          /* DOWN */
          drop table upvotes;           
      `);
  });
});

describe('loadMigration', async () => {
  beforeAll(async () => {
    await testUtils.setupTestDB();

    mock({
      migrations: {
        'CreateUserTable.sql': `
          /* UP */
          create table users(
            id serial primary key,
            name varchar
          );
          /* DOWN */
          drop table users;        
        `,
        'CreatePostTable.sql': `
          /* UP */
          create table posts(
            id serial primary key,
            title varchar,
            content varchar
          );
          /* DOWN */
          drop table posts;           
        `,
        'CreateBookTable.sql': `
        /* UP */
          create table books(
            id serial primary key,
            title varchar,
            author varchar
          );
          /* DOWN */
          drop table books;           
        `,
        'CreateUpvoteTable.sql': `
          /* UP */
          create table upvotes(
            id serial primary key,
            post_id integer,
            user_id integer
          );
          /* DOWN */
          drop table upvotes;           
        `
      }
    });
  });

  afterAll(() => {
    mock.restore();
  });

  it('should load and parse the file specified', async () => {
    const migration = await loadMigration('CreateUpvoteTable.sql');
    expect(migration.up).toEqual(
      'create table upvotes(id serial primary key, post_id integer, user_id integer);'
    );
    expect(migration.down).toEqual('drop table upvotes;');
  });
});

describe('migrationUp', async () => {
  beforeEach(async () => {
    await testUtils.setupTestDB();
  });

  it('should execute the migration', async () => {
    await expect(testUtils.tableExists('upvotes')).resolves.toEqual(false);

    await migrationUp(
      'CreateUpvoteTable.sql',
      'create table upvotes(id serial primary key, post_id integer, user_id integer);'
    );

    await expect(testUtils.tableExists('upvotes')).resolves.toEqual(true);
  });

  it('should insert the migration into the migration table', async () => {
    await migrationUp(
      'CreateUpvoteTable.sql',
      'create table upvotes(id serial primary key, post_id integer, user_id integer);'
    );

    const { rows } = await db.query('SELECT * FROM migrations');
    const migrations = rows.map(row => row.name);
    expect(migrations).toContainEqual('CreateUpvoteTable.sql');
  });
});

describe('migrationDown', async () => {
  beforeEach(async () => {
    await testUtils.setupTestDB();
  });

  it('should execute the migration', async () => {
    await expect(testUtils.tableExists('users')).resolves.toEqual(true);

    await migrationDown('CreateUserTable.sql', 'drop table users;');

    await expect(testUtils.tableExists('users')).resolves.toEqual(false);
  });

  it('should remove the migration from the migration table', async () => {
    await migrationDown('CreateUserTable.sql', 'drop table users;');

    const { rows } = await db.query('SELECT * FROM migrations');
    const migrations = rows.map(row => row.name);
    expect(migrations).not.toContainEqual('CreateUserTable.sql');
  });
});

describe('getRecentMigrations', async () => {
  beforeEach(async () => {
    await testUtils.setupTestDB();
  });

  it('should return the most recently ran migration if no limit argument is passed', async () => {
    const migrations = await getRecentMigrations();
    expect(migrations[0]).toEqual('CreatePostTable.sql');
    expect(migrations.length).toEqual(1);
  });

  it('should return X or less migrations if X is passed', async () => {
    const migrations = await getRecentMigrations(3);
    expect(migrations.length).toBeLessThanOrEqual(3);
  });
});

describe('getSeedFiles', async () => {
  beforeAll(() => {
    mock({
      seeds: {
        'D.js': '',
        'C.js': mock.file({
          content: '',
          birthtime: new Date(1),
          ctime: new Date(1),
          mtime: new Date(1)
        }),
        'B.js': '',
        'randomFile.sql': ''
      }
    });
  });

  afterAll(() => {
    mock.restore();
  });

  it('should return an array of .js files in the order that they were created', async () => {
    await expect(getSeedFiles()).resolves.toEqual(['C.js', 'B.js', 'D.js']);
  });
});
