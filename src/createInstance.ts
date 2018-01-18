import { Pool } from 'pg';
import loadConfig from './loadConfig';
import * as db from './db';
import up from './commands/up';
import create from './commands/create';
import down from './commands/down';

const createInstance = async (env: string = 'development') => {
  const config = await loadConfig();

  if (!config[env]) {
    // tslint:disable-next-line:no-console
    console.log(
      `Could not find a configuration object for the ${env} environment`
    );
    return;
  }

  const dbConnection =
    typeof config[env] === 'string'
      ? {
          connectionString: config[env]
        }
      : config[env];

  db.initPool(dbConnection);
  return {
    config,
    up,
    create,
    down,
    pool: db.pool
  };
};

export default createInstance;
