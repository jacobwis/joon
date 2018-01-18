# joon

A CLI tool for managing PostgreSQL migrations

## Installation

Install joon using [npm](https://www.npmjs.com):

```
npm install joon
```

or via [yarn](https://yarnpkg.com):

```
yarn add joon
```

## Configuration

Create a file named `joonConfig.json` in your project root. All commands will look for a 'development' key by default.

```json
{
  "development": "postgresql://user:password@host:port/db_name"
}
```

## Commands

### create

```
joon create [name]
```

Creates a new migration in the migration directory.

### up

```
joon up
```

Executes all pending migrations.

### down

```
joon down [-c, --c count]
```

Executes the specified number of most recent down migrations in the reverse order. If `--c` value is provided it will just execute the most recent migration.

### reset

```
joon reset
```

Executes all down migrations.

## Options

### env (`-e, --env)`

Specifies the environment to run the migrations in. (default: development)
