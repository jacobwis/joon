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
const readFile = util_1.promisify(fs.readFile);
const loadConfig = () => __awaiter(this, void 0, void 0, function* () {
    const configPath = path.resolve(process.cwd(), 'joonConfig.json');
    const contents = yield readFile(configPath, 'utf8');
    return JSON.parse(contents);
});
exports.default = loadConfig;
