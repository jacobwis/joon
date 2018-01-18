import { promisify } from 'util';
import * as fs from 'fs';

export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);
export const exists = promisify(fs.exists);
export const mkdir = promisify(fs.mkdir);
