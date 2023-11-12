import * as path from 'path';
import * as fs from 'fs';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

// Dynamically find all `dirName.handler.ts` files in src/lambdas
function findHandlers(dir) {
    let results = [];
    const lambdasPath = path.resolve(dir);

    fs.readdirSync(lambdasPath).forEach(function (dirName) {
        const contentPath = path.join(lambdasPath, dirName);
        const stat = fs.statSync(contentPath);

        if (stat && stat.isDirectory()) {
            const handlerFileName = `${dirName}.handler.ts`;
            const handlerFilePath = path.join(contentPath, handlerFileName);
            if (fs.existsSync(handlerFilePath)) {
                results.push(handlerFilePath);
            }
        }
    });

    return results;
}

const entryPoints = findHandlers('src/lambdas');

const result = entryPoints.map(entry => {
    const dirname = path.basename(path.dirname(entry));
    return {
        input: entry,
        output: [
            {
                // Assumes the directory name and the file name prefix are the same
                file: path.join('dist', `${dirname}.js`),
                format: 'cjs',
            },
        ],
        external: [
            'util', 'stream'
        ],
        plugins: [
            json(),
            resolve({preferBuiltins: false, exportConditions: ['node']}),
            commonjs(),
            typescript(),
        ],
    };
});

export default result;