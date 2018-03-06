#!/usr/bin/env node
const app = require('commander');
const Joon = require('../dist');

let joon;

const executeCommand = async (command, env = 'development') => {
  joon = await Joon.createInstance(env);
  await command();
  await joon.end();
};

(() => {
  try {
    app.option(
      '-e, --env [environment]',
      'The environment to run the migrations under',
      val => val,
      'development'
    );

    app
      .command('up')
      .description('Runs all pending migrations')
      .action(async cmd => {
        await executeCommand(async () => {
          await joon.up();
        }, cmd.parent.env);
      });

    app
      .command('create [name]')
      .description('Creates a new migration')
      .action(async name => {
        await executeCommand(async () => {
          const stampedName = name ? `${Date.now()}-${name}` : `${Date.now()}`;
          await joon.create(stampedName);
        });
      });

    app
      .command('down')
      .description(
        'Executes the specified number of most recent down migrations in the reverse order. (Default: 1)'
      )
      .option(
        '-c, --count [count]',
        'The number of down migrations to be executed'
      )
      .action(async cmd => {
        await executeCommand(async () => {
          await joon.down(cmd.count || 1);
        }, cmd.parent.env);
      });

    app
      .command('reset')
      .description('Executes all down migrations')
      .action(async cmd => {
        await executeCommand(async () => {
          await joon.reset();
        }, cmd.parent.env);
      });

    app
      .command('seed')
      .description(
        'Executes all files in the seed directory in the order that they were created.'
      )
      .action(async cmd => {
        await executeCommand(async () => {
          await joon.seed();
        }, cmd.parent.env);
      });

    app.parse(process.argv);
  } catch (e) {
    console.log(e);
  }
})();
