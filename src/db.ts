import { Pool, QueryResult, PoolConfig } from 'pg';

let pool: Pool;

const initPool = (config: PoolConfig) => {
  if (!pool) {
    pool = new Pool(config);
  }
};

const endPool = async () => {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
};

const query = async (text: string, values: any[] = []) => {
  if (!pool) {
    throw new Error('You must first initialize a pool.');
  }

  return await pool.query(text, values);
};

export { initPool, endPool, pool, query };
