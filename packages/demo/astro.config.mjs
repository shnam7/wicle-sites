// @ts-check
import {defineConfig} from 'astro/config'

// https://astro.build/config
export default defineConfig({
    vite: {
        css: {
            transformer: 'lightningcss',
            preprocessorOptions: {
                scss: {
                    loadPaths: ['node_modules/sass-wdk', 'src/styles/ext'],
                },
            },
        },
        build: {
            rollupOptions: {
                output: {
                    globals: {},
                },
            },
        },
        resolve: {
            alias: [
                {find: '@', replacement: './src'},
                {find: '@@', replacement: './'},
            ],
        },
    },
})
