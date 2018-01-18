"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const util_1 = require("util");
const path = require("path");
const migrationUtils_1 = require("./../utils/migrationUtils");
const db = require("../db");
const readFile = util_1.promisify(fs.readFile);
const up = () => __awaiter(this, void 0, void 0, function* () {
    yield db.query('CREATE TABLE IF NOT EXISTS migrations(id serial primary key, name varchar, run_on timestamp without time zone);');
    const migrationsDir = path.resolve(process.cwd(), 'migrations');
    const pendingMigrations = yield migrationUtils_1.getPendingMigrations();
    for (const pendingMigration of pendingMigrations) {
        const migration = yield migrationUtils_1.loadMigration(pendingMigration);
        yield migrationUtils_1.migrationUp(pendingMigration, migration.up);
    }
});
exports.default = up;
