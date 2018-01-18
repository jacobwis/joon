#!/usr/bin/env node
const app = require('commander');
const Joon = require('../dist');

let joon;

const executeCommand = async (command, env = 'development') => {
  joon = await Joon.createInstance(env);
  await command();
  await joon.pool.end();
};

(() => {
  try {
    app
      .command('up')
      .option('-e, --env [environment]', '', val => val, 'development')
      .action(async ({ env }) => {
        console.log(env);
        await executeCommand(async () => {
          await joon.up();
        }, env);
      });

    app.command('create [name]').action(async name => {
      await executeCommand(async () => {
        const stampedName = `${name}-${Date.now()}`;
        await joon.create(stampedName);
      });
    });

    app
      .command('down')
      .option('-c, --count [count]')
      .option('-e, --env [environment]', '', val => val, 'development')
      .action(async ({ count, env }) => {
        console.log(env);
        await executeCommand(async () => {
          await joon.down(count || 1);
        }, env);
      });

    app
      .command('reset')
      .option('-e, --env [environment]', '', val => val, 'development')
      .action(async ({ env }) => {
        await executeCommand(async () => {
          await joon.reset();
        }, env);
      });

    app.parse(process.argv);
  } catch (e) {
    console.log(e);
  }
})();
