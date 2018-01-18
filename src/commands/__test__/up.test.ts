import * as mock from 'mock-fs';
import * as db from '../../db';
import * as testUtils from '../../../test/utils';
import up from '../up';

afterAll(async () => {
  await Promise.all([testUtils.endPool(), db.endPool()]);
});

describe('up', () => {
  beforeAll(async () => {
    db.initPool({
      connectionString: 'posgresql://jacobwisniewski@localhost/joon_test'
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

  it('should execute each up migration that hasnt already been run', async () => {
    await expect(testUtils.tableExists('books')).resolves.toEqual(false);
    await expect(testUtils.tableExists('upvotes')).resolves.toEqual(false);

    await up();

    const bookTableCreated = await testUtils.tableExists('books');
    const upvoteTableCreated = await testUtils.tableExists('upvotes');

    expect(bookTableCreated).toEqual(true);
    expect(upvoteTableCreated).toEqual(true);
  });

  it('should insert the migrations into the migrations table', async () => {
    await up();

    const { rows } = await db.query('SELECT * FROM migrations');
    const migrations = rows.map(row => row.name);
    expect(migrations).toContainEqual('CreateBookTable.sql');
    expect(migrations).toContainEqual('CreateUpvoteTable.sql');
  });
});
