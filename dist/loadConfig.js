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
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs-extra");
const loadConfig = () => __awaiter(this, void 0, void 0, function* () {
    const dotEnvExists = yield fs.pathExists('.env');
    if (dotEnvExists) {
        dotenv.config();
    }
    const configPath = path.resolve(process.cwd(), 'joonConfig.json');
    const contents = yield fs.readFile(configPath, 'utf8');
    const config = JSON.parse(contents);
    for (const key in config) {
        if (config.hasOwnProperty(key)) {
            const element = config[key];
            if (typeof element === 'object' && element.ENV) {
                config[key] = process.env[element.ENV];
            }
        }
    }
    return config;
});
exports.default = loadConfig;
