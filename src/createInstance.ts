import loadConfig from './loadConfig';
import Joon from './Joon';
import * as db from './db';

export const createInstance = async (
  env: string = 'development',
  quiet: boolean = false
) => {
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

  const joon = new Joon();

  if (quiet) {
    joon.shouldLog = false;
  }

  return joon;
};
