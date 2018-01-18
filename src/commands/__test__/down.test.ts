import * as mock from 'mock-fs';
import * as db from '../../db';
import * as testUtils from '../../../test/utils';
import down from '../down';

afterAll(async () => {
  await Promise.all([testUtils.endPool(), db.endPool()]);
});

describe('down', () => {
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
  });

  it('should execute only the most recent migration if no count parameter is passed', async () => {
    await expect(testUtils.tableExists('users')).resolves.toEqual(true);
    await expect(testUtils.tableExists('posts')).resolves.toEqual(true);

    await down();

    await expect(testUtils.tableExists('posts')).resolves.toEqual(false);
    await expect(testUtils.tableExists('users')).resolves.toEqual(true);
  });

  it('should execute multiple migrations if the count is specified', async () => {
    await expect(testUtils.tableExists('users')).resolves.toEqual(true);
    await expect(testUtils.tableExists('posts')).resolves.toEqual(true);

    await down(3);

    await expect(testUtils.tableExists('posts')).resolves.toEqual(false);
    await expect(testUtils.tableExists('users')).resolves.toEqual(false);
  });
});
