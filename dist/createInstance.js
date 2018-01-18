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
const loadConfig_1 = require("./loadConfig");
const db = require("./db");
const up_1 = require("./commands/up");
const create_1 = require("./commands/create");
const down_1 = require("./commands/down");
const reset_1 = require("./commands/reset");
const createInstance = (env = 'development') => __awaiter(this, void 0, void 0, function* () {
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
    return {
        config,
        up: up_1.default,
        create: create_1.default,
        down: down_1.default,
        reset: reset_1.default,
        pool: db.pool
    };
});
exports.default = createInstance;
