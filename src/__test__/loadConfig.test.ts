import * as mock from 'mock-fs';
import loadConfig from '../loadConfig';

describe('loadConfig', () => {
  beforeEach(() => {
    mock({
      'joonConfig.json': '{ "dev": "" }'
    });
  });

  afterEach(() => {
    mock.restore();
  });

  it('should load a configuration file from the current working directory', async () => {
    const config = await loadConfig();
    expect(config).toEqual({
      dev: ''
    });
  });

  it('should proplerly load a .env file if it exists', async () => {
    mock({
      'joonConfig.json': `{ "dev": {"ENV": "DB_DEV"}}`,
      '.env': 'DB_DEV=dbconn'
    });

    await expect(loadConfig()).resolves.toEqual({
      dev: 'dbconn'
    });
  });
});
