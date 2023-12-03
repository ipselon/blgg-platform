import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import { VitePluginNode } from 'vite-plugin-node';

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
        };
    } else {
        // Production build configuration
        if (process.env.BUILD_TARGET === 'handler') {
            const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
            return {
                resolve: {
                    alias: {
                        'common-utils': '../common-utils/dist/index.mjs',
                    },
                },
                build: {
                    minify: false,
                    outDir: 'dist',
                    commonjsOptions: {
                        strictRequires: true,
                    },
                    rollupOptions: {
                        input: path.resolve(__dirname, 'src', 'index.ts'),
                        output: {
                            format: 'cjs',
                            entryFileNames: '[name].js',
                        },
                        preserveEntrySignatures: 'strict',
                        external: [
                            'util',
                            'tty',
                            'string_decoder',
                            'fs',
                            'http',
                            'https',
                            'path',
                            'net',
                            'async_hooks',
                            'crypto',
                            'stream',
                            'zlib',
                            ...Object.keys(pkg.devDependencies || {})
                        ]
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
