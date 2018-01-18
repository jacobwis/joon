import * as mock from 'mock-fs';
import loadConfig from '../loadConfig';

describe('loadConfig', () => {
  beforeEach(() => {
    mock({
      'joonConfig.json': `{ "dev": "posgresql://jacobwisniewski@localhost/joon_test"}`
    });
  });

  afterEach(() => {
    mock.restore();
  });

  it('should load and parse a joonConfig.json file from the current working directory', async () => {
    const config = await loadConfig();
    expect(config).toEqual({
      dev: 'posgresql://jacobwisniewski@localhost/joon_test'
    });
  });
});
