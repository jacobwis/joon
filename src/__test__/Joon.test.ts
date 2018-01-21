import * as sinon from 'sinon';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as mock from 'mock-fs';
import * as db from '../db';
import * as testUtils from '../../test/utils';

import Joon, { migrationTemplate } from '../Joon';

describe('Joon', () => {
  afterAll(async () => {
    await Promise.all([testUtils.endPool(), db.endPool()]);
  });

  describe('joon.create()', () => {
    let joon;
    const sandbox = sinon.createSandbox();
    let consoleSpy;

    beforeAll(async () => {
      joon = new Joon();
    });

    beforeEach(() => {
      mock({});

      consoleSpy = sandbox.stub(console, 'log');
    });

    afterEach(() => {
      mock.restore();
      sandbox.restore();
    });

    it('should create a migration in the migrations directory', async () => {
      mock({
        migrations: {}
      });

      await joon.create('CreatePostTable');

      const migrationDir = path.resolve(process.cwd(), 'migrations');
      await expect(fs.readdir(migrationDir)).resolves.toContainEqual(
        'CreatePostTable.sql'
      );
    });

    it('should create a migration matching the template', async () => {
      mock({
        migrations: {}
      });

      await joon.create('CreatePostTable');

      const filePath = path.resolve(
        process.cwd(),
        'migrations',
        'CreatePostTable.sql'
      );

      await expect(fs.readFile(filePath, 'utf8')).resolves.toEqual(
        migrationTemplate
      );
    });

    it('should create the migrations directory if it does not already exist', async () => {
      mock({});
      const migrationDir = path.resolve(process.cwd(), 'migrations');

      await expect(fs.pathExists(migrationDir)).resolves.toEqual(false);

      await joon.create('CreatePostTable');

      await expect(fs.pathExists(migrationDir)).resolves.toEqual(true);
    });

    it('should log a message if the joon.shouldLog is true', async () => {
      mock({
        migrations: {}
      });

      await joon.create('CreatePostTable');

      expect(consoleSpy.calledWith('Created CreatePostTable.sql')).toEqual(
        true
      );
    });

    it('should not log a message if joon.shouldLog is false', async () => {
      mock({
        migrations: {}
      });

      joon.shouldLog = false;

      await joon.create('CreatePostTable');
      expect(consoleSpy.callCount).toEqual(0);
    });
  });

  describe('joon.up()', () => {
    const sandbox = sinon.createSandbox();
    let consoleSpy;

    beforeAll(async () => {
      db.initPool({
        connectionString: 'postgresql://jacobwisniewski@localhost/joon_test'
      });

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

    afterAll(async () => {
      await db.endPool();
      mock.restore();
    });

    beforeEach(async () => {
      consoleSpy = sandbox.stub(console, 'log');
      await testUtils.setupTestDB();
    });

    afterEach(async () => {
      sandbox.restore();
    });

    it('should execute each up migration that hasnt already been run', async () => {
      await expect(testUtils.tableExists('books')).resolves.toEqual(false);
      await expect(testUtils.tableExists('upvotes')).resolves.toEqual(false);

      const joon = new Joon();
      await joon.up();

      const bookTableCreated = await testUtils.tableExists('books');
      const upvoteTableCreated = await testUtils.tableExists('upvotes');

      expect(bookTableCreated).toEqual(true);
      expect(upvoteTableCreated).toEqual(true);
    });

    it('should insert the migrations into the migrations table', async () => {
      const joon = new Joon();
      await joon.up();

      const { rows } = await db.query('SELECT * FROM migrations');
      const migrations = rows.map(row => row.name);
      expect(migrations).toContainEqual('CreateBookTable.sql');
      expect(migrations).toContainEqual('CreateUpvoteTable.sql');
    });

    it('should output a message if joon.shouldLog is true', async () => {
      const joon = new Joon();
      await joon.up();

      expect(consoleSpy.called).toEqual(true);
    });

    it('should not output a message if joon.shouldLog is false', async () => {
      const joon = new Joon();
      joon.shouldLog = false;
      await joon.up();

      expect(consoleSpy.called).toEqual(false);
    });
  });

  describe('joon.down()', () => {
    const sandbox = sinon.createSandbox();
    let consoleSpy;

    beforeAll(async () => {
      db.initPool({
        connectionString: 'postgresql://jacobwisniewski@localhost/joon_test'
      });

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

    afterAll(async () => {
      await db.endPool();
      mock.restore();
    });

    beforeEach(async () => {
      await testUtils.setupTestDB();
      consoleSpy = sandbox.stub(console, 'log');
    });

    afterEach(async () => {
      sandbox.restore();
    });

    it('should execute only the most recent migration if no count parameter is passed', async () => {
      await expect(testUtils.tableExists('users')).resolves.toEqual(true);
      await expect(testUtils.tableExists('posts')).resolves.toEqual(true);

      const joon = new Joon();
      await joon.down();

      await expect(testUtils.tableExists('posts')).resolves.toEqual(false);
      await expect(testUtils.tableExists('users')).resolves.toEqual(true);
    });

    it('should execute multiple migrations if the count is specified', async () => {
      await expect(testUtils.tableExists('users')).resolves.toEqual(true);
      await expect(testUtils.tableExists('posts')).resolves.toEqual(true);

      const joon = new Joon();
      await joon.down(3);

      await expect(testUtils.tableExists('posts')).resolves.toEqual(false);
      await expect(testUtils.tableExists('users')).resolves.toEqual(false);
    });

    it('should log a message if the joon.shouldLog is true', async () => {
      const joon = new Joon();
      await joon.down();

      expect(consoleSpy.called).toEqual(true);
    });

    it('should not log a message if joon.shouldLog is false', async () => {
      const joon = new Joon();
      joon.shouldLog = false;

      await joon.down();
      expect(consoleSpy.callCount).toEqual(0);
    });
  });

  describe('reset', () => {
    const sandbox = sinon.createSandbox();
    let consoleSpy;

    beforeAll(async () => {
      db.initPool({
        connectionString: 'postgresql://jacobwisniewski@localhost/joon_test'
      });

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

    afterAll(async () => {
      await db.endPool();
      mock.restore();
    });

    beforeEach(async () => {
      await testUtils.setupTestDB();
      consoleSpy = sandbox.stub(console, 'log');
    });

    afterEach(async () => {
      sandbox.restore();
    });

    it('should execute all down migrations', async () => {
      await expect(testUtils.tableExists('users')).resolves.toEqual(true);
      await expect(testUtils.tableExists('posts')).resolves.toEqual(true);

      const joon = new Joon();
      await joon.reset();

      await expect(testUtils.tableExists('users')).resolves.toEqual(false);
      await expect(testUtils.tableExists('posts')).resolves.toEqual(false);
    });

    it('should remove all migrations from the migrations table', async () => {
      const joon = new Joon();
      await joon.reset();

      const { rows } = await db.query('SELECT * FROM migrations');
      expect(rows.length).toEqual(0);
    });

    it('should log a message if the joon.shouldLog is true', async () => {
      const joon = new Joon();
      await joon.reset();

      expect(consoleSpy.called).toEqual(true);
    });

    it('should not log a message if joon.shouldLog is false', async () => {
      const joon = new Joon();
      joon.shouldLog = false;

      await joon.reset();
      expect(consoleSpy.callCount).toEqual(0);
    });
  });

  describe('joon.seed()', () => {
    beforeAll(async () => {
      db.initPool({
        connectionString: 'postgresql://jacobwisniewski@localhost/joon_test'
      });
    });

    afterAll(async () => {
      await db.endPool();
      mock.restore();
    });

    beforeEach(async () => {
      await testUtils.setupTestDB();
      mock({
        seeds: {
          'seed.js': `
            module.exports = async (db) => {
              await db.query("INSERT INTO users(name) VALUES('john')");
              await db.query("INSERT INTO users(name) VALUES('jacob')");
              await db.query("INSERT INTO users(name) VALUES('mark')");
            }
          `
        }
      });
    });

    it('should execute seed files', async () => {
      const joon = new Joon();
      await joon.seed();

      const res = await db.query('SELECT * FROM users;');
      const users = res.rows.map(row => row.name);
      expect(users).toEqual(['john', 'jacob', 'mark']);
    });
  });
});
