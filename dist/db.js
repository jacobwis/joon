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
const pg_1 = require("pg");
let pool;
exports.pool = pool;
const initPool = (config) => {
    if (!pool) {
        exports.pool = pool = new pg_1.Pool(config);
    }
};
exports.initPool = initPool;
const endPool = () => __awaiter(this, void 0, void 0, function* () {
    if (pool) {
        yield pool.end();
        exports.pool = pool = undefined;
    }
});
exports.endPool = endPool;
const query = (text, values = []) => __awaiter(this, void 0, void 0, function* () {
    if (!pool) {
        throw new Error('You must first initialize a pool.');
    }
    return yield pool.query(text, values);
});
exports.query = query;
