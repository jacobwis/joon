const db = require('./db');

const utils = {
  dropTables: async () => {
    await db.query('DROP TABLE IF EXISTS migrations');
  },
  createTables: async () => {
    await db.query(
      'CREATE TABLE IF NOT EXISTS migrations(id serial primary key, name varchar, run_on timestamp without time zone);'
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
  }
};

module.exports = utils;
