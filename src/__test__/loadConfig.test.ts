import * as mock from 'mock-fs';
import loadConfig from '../loadConfig';

describe('loadConfig', () => {
  beforeAll(() => {
    mock({
      'joonConfig.json': '{ "dev": "" }'
    });
  });

  afterAll(() => {
    mock.restore();
  });

  it('should load a configuration file from the current working directory', async () => {
    const config = await loadConfig();
    expect(config).toEqual({
      dev: ''
    });
  });
});
