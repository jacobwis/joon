#!/usr/bin/env node
const app = require('commander');
const Joon = require('../dist');

(() => {
  try {
    app.command('up').action(async () => {
      const joon = await Joon.createInstance();
      await joon.up();
      await joon.pool.end();
    });

    app.parse(process.argv);
  } catch (e) {
    console.log(e);
  }
})();
