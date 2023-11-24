import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import { VitePluginNode } from 'vite-plugin-node';

function getFunctionEntries() {
    const functionsDir = path.resolve(__dirname, 'src', 'functions');
    const entries = fs.readdirSync(functionsDir).reduce((entries, file) => {
        if (file.endsWith('.ts')) {
            const name = path.parse(file).name;
            entries[name] = path.resolve(functionsDir, file);
        }
        return entries;
    }, {});

    console.log('Function entries: ', JSON.stringify(entries, null, 4));

    return entries;
}

export default defineConfig(({ command, mode }) => {
    console.log('Build Target:', process.env.BUILD_TARGET);
    if (command === 'serve') {
        // Development server configuration
        return {
            plugins: [
                // ... other plugins
                ...VitePluginNode({
                    adapter: 'express',
                    appPath: './src/server.ts',
                    exportName: 'viteNodeApp',
                    optimizeDeps: {
                        exclude: ['common-utils']
                    }
                }),
            ],
            resolve: {
                alias: {
                    'common-utils': '../common-utils/dist/index.mjs',
                }
            },
            server: {
                port: 3030
            },
            // Add any plugins needed for development
        };
    } else {
        // Production build configuration
        if (process.env.BUILD_TARGET === 'functions') {
            // Build configuration for functions
            return {
                resolve: {
                    alias: {
                        'common-utils': '../common-utils/dist/index.mjs',
                    }
                },
                build: {
                    minify: false,
                    outDir: 'dist/functions',
                    rollupOptions: {
                        input: getFunctionEntries(),
                        output: {
                            format: 'cjs',
                            entryFileNames: '[name].js',
                        },
                        preserveEntrySignatures: 'strict',
                        external: ['fs', 'path', '@aws-sdk/client-dynamodb']
                    },
                },
            };
        } else {
            // Build configuration for the server
            // return {
            //     resolve: {
            //         alias: {
            //             'common-utils': '../common-utils/dist/index.mjs',
            //         }
            //     },
            //     build: {
            //         outDir: 'dist/server',
            //         rollupOptions: {
            //             input: path.resolve(__dirname, 'src', 'server.ts'),
            //             output: {
            //                 format: 'cjs',
            //             },
            //         },
            //         external: ['fs', 'path']
            //     },
            // };
        }
    }
});
