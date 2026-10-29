import {readFileSync} from 'node:fs';
const packages = JSON.parse(readFileSync(process.argv[2], 'utf8')).packages;
console.log(JSON.stringify(Object.entries(packages)
  .filter(([name, item]) => name && item.resolved)
  .map(([name, item]) => ({name, version: item.version, resolved: item.resolved, integrity: item.integrity})), null, 2));
