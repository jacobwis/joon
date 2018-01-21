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
const fs = require("fs-extra");
const db = require("./db");
const utils = require("./utils/migrationUtils");
exports.migrationTemplate = `/* UP */\n\n/* DOWN */\n\n`;
class Joon {
    constructor() {
        this.shouldLog = true;
    }
    create(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileName = `${name}.sql`;
            const migrationDir = path.resolve(process.cwd(), 'migrations');
            const filePath = path.resolve(migrationDir, fileName);
            if (!(yield fs.pathExists(migrationDir))) {
                yield fs.mkdirSync(migrationDir);
            }
            yield fs.writeFile(filePath, exports.migrationTemplate, 'utf8');
            this.log(`Created ${fileName}`);
        });
    }
    up() {
        return __awaiter(this, void 0, void 0, function* () {
            yield db.query('CREATE TABLE IF NOT EXISTS migrations(id serial primary key, name varchar, run_on timestamp without time zone);');
            const migrationsDir = path.resolve(process.cwd(), 'migrations');
            const pendingMigrations = yield utils.getPendingMigrations();
            for (const pendingMigration of pendingMigrations) {
                const migration = yield utils.loadMigration(pendingMigration);
                yield utils.migrationUp(pendingMigration, migration.up);
                this.log(`Executed ${pendingMigration} (up)`);
            }
        });
    }
    down(count = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            const recentMigrations = yield utils.getRecentMigrations(count);
            for (const migrationName of recentMigrations) {
                const migration = yield utils.loadMigration(migrationName);
                yield utils.migrationDown(migrationName, migration.down);
                this.log(`Executed ${migrationName} (down)`);
            }
        });
    }
    reset() {
        return __awaiter(this, void 0, void 0, function* () {
            const completedMigrations = yield utils.getCompletedMigrations();
            for (const migrationName of completedMigrations) {
                const migration = yield utils.loadMigration(migrationName);
                yield utils.migrationDown(migrationName, migration.down);
                this.log(`Executed ${migrationName} (down)`);
            }
        });
    }
    end() {
        return __awaiter(this, void 0, void 0, function* () {
            if (db.pool) {
                yield db.endPool();
            }
        });
    }
    seed() {
        return __awaiter(this, void 0, void 0, function* () {
            const seedDir = path.resolve(process.cwd(), 'seeds');
            const seedFiles = yield utils.getSeedFiles();
            for (const seedFile of seedFiles) {
                this.log(`Running ${seedFile}`);
                const seedfn = require(`${seedDir}/${seedFile}`);
                yield seedfn(db);
            }
        });
    }
    log(message) {
        if (this.shouldLog) {
            // tslint:disable-next-line:no-console
            console.log(message);
        }
    }
}
exports.default = Joon;
