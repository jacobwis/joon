#!/usr/bin/env node
const app = require('commander');
const Joon = require('../dist');

let joon;

const executeCommand = async command => {
  joon = await Joon.createInstance();
  await command();
  await joon.pool.end();
};

(() => {
  try {
    app.command('up').action(async () => {
      const joon = await Joon.createInstance();
      await joon.up();
      await joon.pool.end();
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
      .action(async ({ count }) => {
        await executeCommand(async () => {
          await joon.down(count || 1);
        });
      });

    app.command('reset').action(async () => {
      await executeCommand(async () => {
        await joon.reset();
      });
    });

    app.parse(process.argv);
  } catch (e) {
    console.log(e);
  }
})();
