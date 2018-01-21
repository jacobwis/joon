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
const Joon_1 = require("./Joon");
const db = require("./db");
exports.createInstance = (env = 'development', quiet = false) => __awaiter(this, void 0, void 0, function* () {
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
    const joon = new Joon_1.default();
    if (quiet) {
        joon.shouldLog = false;
    }
    return joon;
});
