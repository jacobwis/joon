import * as mock from 'mock-fs';
import * as testUtils from '../../../test/utils';
import * as db from '../../db';
import {
  getCompletedMigrations,
  getPendingMigrations,
  parseMigration,
  formatSQL,
  loadMigrationFile
} from '../migrationUtils';

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

describe('getPendingMigrations', () => {
  let pendingMigrations;

  beforeAll(async () => {
    await testUtils.setupTestDB();

    mock({
      migrations: {
        'CreateUserTable.sql': '',
        'CreatePostTable.sql': '',
        'CreateBookTable.sql': '',
        'CreateUpvoteTable.sql': '',
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
