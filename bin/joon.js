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

    app.parse(process.argv);
  } catch (e) {
    console.log(e);
  }
})();
