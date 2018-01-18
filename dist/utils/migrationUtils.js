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
const path = require("path");
const fs = require("fs");
const util_1 = require("util");
const db = require("../db");
const readdir = util_1.promisify(fs.readdir);
const readFile = util_1.promisify(fs.readFile);
exports.getCompletedMigrations = () => __awaiter(this, void 0, void 0, function* () {
    const { rows } = yield db.query('SELECT * FROM migrations');
    return rows.map(row => row.name);
});
exports.getPendingMigrations = () => __awaiter(this, void 0, void 0, function* () {
    const migrationsDir = path.resolve(process.cwd(), 'migrations');
    const completedMigrations = yield exports.getCompletedMigrations();
    const migrations = yield readdir(migrationsDir);
    return migrations.filter(migration => {
        if (path.extname(migration) !== '.sql') {
            return false;
        }
        return completedMigrations.indexOf(migration) === -1;
    });
});
exports.parseMigration = (contents) => {
    const START_TOKEN = '/* UP */';
    const DOWN_TOKEN = '/* DOWN */';
    const up = contents.substring(contents.indexOf(START_TOKEN) + START_TOKEN.length, contents.indexOf(DOWN_TOKEN));
    const down = contents.substring(contents.indexOf(DOWN_TOKEN) + DOWN_TOKEN.length);
    return {
        up: exports.formatSQL(up),
        down: exports.formatSQL(down)
    };
};
exports.formatSQL = (contents) => {
    return contents
        .trim()
        .split('\n')
        .map(line => line.trim())
        .join(' ')
        .replace('( ', '(')
        .replace(' )', ')');
};
exports.loadMigrationFile = (name) => __awaiter(this, void 0, void 0, function* () {
    const migrationPath = path.resolve(process.cwd(), 'migrations', name);
    return yield readFile(migrationPath, 'utf8');
});
exports.loadMigration = (name) => __awaiter(this, void 0, void 0, function* () {
    const contents = yield exports.loadMigrationFile(name);
    return exports.parseMigration(contents);
});
exports.migrationUp = (name, sql) => __awaiter(this, void 0, void 0, function* () {
    yield db.query(sql);
    yield db.query('INSERT INTO migrations(name, run_on) VALUES($1, $2);', [
        name,
        new Date()
    ]);
});
exports.migrationDown = (name, sql) => __awaiter(this, void 0, void 0, function* () {
    yield db.query(sql);
    yield db.query('DELETE FROM migrations WHERE name = $1', [name]);
});
exports.getRecentMigrations = (limit = 1) => __awaiter(this, void 0, void 0, function* () {
    const { rows } = yield db.query('SELECT * FROM migrations ORDER BY run_on DESC LIMIT $1;', [limit]);
    return rows.map(row => row.name);
});
