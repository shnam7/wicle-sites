// @ts-check
import {defineConfig} from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
        css: {
            transformer: 'lightningcss',
            preprocessorOptions: {
                scss: {
                    loadPaths: ['node_modules/sass-wdk', 'node_modules/wicle-sites'],
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
        // server: {
        //     watch: {
        //         // Watch for changes in shared packages
        //         ignored: ['!**/packages/**'],
        //     },
        // },
        // optimizeDeps: {
        //     include: ['wicle-sites'],
        // },
        // ssr: {
        //     noExternal: ['wicle-sites'],
        // },
    },
})
