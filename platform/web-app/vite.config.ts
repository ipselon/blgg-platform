import {unstable_vitePlugin as remix} from "@remix-run/dev";
import {defineConfig} from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [
        remix({
            appDirectory: "app",
            assetsBuildDirectory: "static",
            publicPath: "/static/",
        }),
        tsconfigPaths()
    ],
    server: {
        host: '0.0.0.0',
        cors: {
            origin: '*'
        },
        port: 3000,
    }
});
