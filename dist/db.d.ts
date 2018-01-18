import { Pool, QueryResult, PoolConfig } from 'pg';
declare let pool: Pool;
declare const initPool: (config: PoolConfig) => void;
declare const endPool: () => Promise<void>;
declare const query: (text: string, values?: any[]) => Promise<QueryResult>;
export { initPool, endPool, pool, query };
