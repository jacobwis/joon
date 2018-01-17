const db = require('./db');

module.exports = async () => {
  await db.pool.end();
};
