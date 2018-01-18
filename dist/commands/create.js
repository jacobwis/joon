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
const writeFile = util_1.promisify(fs.writeFile);
const exists = util_1.promisify(fs.exists);
const mkdir = util_1.promisify(fs.mkdir);
exports.migrationTemplate = `/* UP */\n\n/* DOWN */\n\n`;
const create = (name) => __awaiter(this, void 0, void 0, function* () {
    const migrationDir = path.resolve(process.cwd(), 'migrations');
    const filePath = path.resolve(migrationDir, `${name}.sql`);
    if (!(yield exists(migrationDir))) {
        yield mkdir(migrationDir);
    }
    yield writeFile(filePath, exports.migrationTemplate, 'utf8');
});
exports.default = create;
