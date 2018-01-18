import * as db from '../db';

export const getCompletedMigrations = async () => {
  const { rows } = await db.query('SELECT * FROM migrations');
  return rows.map(row => row.name);
};
