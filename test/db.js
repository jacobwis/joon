const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://jacobwisniewski@localhost/joon_test'
});

module.exports = {
  query: async (text, params) => {
    return await pool.query(text, params);
  },
  pool
};
