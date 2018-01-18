import * as path from 'path';
import * as mock from 'mock-fs';
import * as fs from 'fs';
import { create, migrationTemplate } from '../create';

describe('create', () => {
  afterEach(() => {
    mock.restore();
  });

  it('should create a migration file in the migrations folder', async () => {
    mock({
      migrations: {}
    });

    await create('CreatePostTable');
    const created = fs.existsSync(
      path.resolve(process.cwd(), 'migrations', 'CreatePostTable.sql')
    );
    expect(created).toEqual(true);
  });

  it('should create a mmigration file containing the correct contents', async () => {
    mock({
      migrations: {}
    });

    await create('CreatePostTable');
    const contents = fs.readFileSync(
      path.resolve(process.cwd(), 'migrations/CreatePostTable.sql'),
      'utf8'
    );
    expect(contents).toEqual(migrationTemplate);
  });

  it('should create the migrations directory if it does not exist', async () => {
    mock({});

    await create('CreatePostTable');
    expect(fs.existsSync(`${process.cwd()}/migrations`)).toEqual(true);
  });
});
