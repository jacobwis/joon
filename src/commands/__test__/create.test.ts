import * as path from 'path';
import * as mock from 'mock-fs';
import * as fs from 'fs';
import create, { migrationTemplate } from '../create';

describe('create', () => {
  beforeEach(() => {
    mock({});
  });

  afterEach(() => {
    mock.restore();
  });

  it('should create a migration in the migrations directory', async () => {
    mock({
      migrations: {}
    });

    await create('CreatePostTable');

    const migrationDir = path.resolve(process.cwd(), 'migrations');
    expect(fs.readdirSync(migrationDir, 'utf8')).toContainEqual(
      'CreatePostTable.sql'
    );
  });

  it('should create a migration matching the template', async () => {
    mock({
      migrations: {}
    });

    await create('CreatePostTable');

    const filePath = path.resolve(
      process.cwd(),
      'migrations',
      'CreatePostTable.sql'
    );
    expect(fs.readFileSync(filePath, 'utf8')).toEqual(migrationTemplate);
  });

  it('should create the migrations directory if it does not already exist', async () => {
    mock({});
    const migrationDir = path.resolve(process.cwd(), 'migrations');

    expect(fs.existsSync(migrationDir)).toEqual(false);

    await create('CreatePostTable');

    expect(fs.existsSync(migrationDir)).toEqual(true);
  });
});
