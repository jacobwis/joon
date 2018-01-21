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
const loadConfig_1 = require("./loadConfig");
exports.migrationTemplate = `/* UP */\n\n/* DOWN */\n\n`;
class Joon {
    constructor() {
        this.shouldLog = true;
    }
    static createInstance(env = 'development', quiet = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = yield loadConfig_1.default();
            if (!config[env]) {
                // tslint:disable-next-line:no-console
                console.log(`Could not find a configuration object for the ${env} environment`);
                return;
            }
            const dbConnection = typeof config[env] === 'string'
                ? {
                    connectionString: config[env]
                }
                : config[env];
            db.initPool(dbConnection);
            const joon = new Joon();
            if (quiet) {
                joon.shouldLog = false;
            }
            return joon;
        });
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
            if (this.shouldLog) {
                // tslint:disable-next-line:no-console
                console.log(`Created ${fileName}`);
            }
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
                if (this.shouldLog) {
                    // tslint:disable-next-line:no-console
                    console.log(`Executed ${pendingMigration} (up)`);
                }
            }
        });
    }
    down(count = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            const recentMigrations = yield utils.getRecentMigrations(count);
            for (const migrationName of recentMigrations) {
                const migration = yield utils.loadMigration(migrationName);
                yield utils.migrationDown(migrationName, migration.down);
            }
        });
    }
    reset() {
        return __awaiter(this, void 0, void 0, function* () {
            const completedMigrations = yield utils.getCompletedMigrations();
            for (const migrationName of completedMigrations) {
                const migration = yield utils.loadMigration(migrationName);
                yield utils.migrationDown(migrationName, migration.down);
            }
        });
    }
    end() {
        return __awaiter(this, void 0, void 0, function* () {
            yield db.pool.end();
        });
    }
}
exports.default = Joon;
