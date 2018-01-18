import { Pool } from 'pg';
declare const createInstance: (env?: string) => Promise<{
    config: any;
    up: () => Promise<void>;
    create: (name: string) => Promise<void>;
    down: (count?: number) => Promise<void>;
    reset: () => Promise<void>;
    pool: Pool;
}>;
export default createInstance;
