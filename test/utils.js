const db = require('./db');

const utils = {
  dropTables: async () => {
    await db.query('DROP TABLE IF EXISTS migrations');
    await db.query('DROP TABLE IF EXISTS users');
    await db.query('DROP TABLE IF EXISTS posts');
    await db.query('DROP TABLE IF EXISTS books');
    await db.query('DROP TABLE IF EXISTS upvotes');
  },
  createTables: async () => {
    await db.query(
      'CREATE TABLE IF NOT EXISTS migrations(id serial primary key, name varchar, run_on timestamp without time zone);'
    );
    await db.query(
      'create table if not exists users(id serial primary key, name varchar);'
    );
    await db.query(
      'create table if not exists posts(id serial primary key, title varchar, content varchar);'
    );
  },
  resetDB: async () => {
    await utils.dropTables();
    await utils.createTables();
  },
  seedDB: async () => {
    await db.query('INSERT INTO migrations(name, run_on) VALUES($1, $2);', [
      'CreateUserTable.sql',
      new Date()
    ]);
    await db.query('INSERT INTO migrations(name, run_on) VALUES($1, $2);', [
      'CreatePostTable.sql',
      new Date()
    ]);
  },
  setupTestDB: async () => {
    await utils.resetDB();
    await utils.seedDB();
  },
  tableExists: async tableName => {
    const { rows } = await db.query('SELECT to_regclass($1);', [tableName]);
    return rows[0].to_regclass === tableName;
  },
  endPool: async () => {
    await db.pool.end();
  }
};

module.exports = utils;
