// @ts-check
import {defineConfig} from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

/** @type {import('vite').Plugin} */
const fixAstroServerApp = {
    name: 'fix-astro-server-app',
    enforce: 'pre',
    async resolveId(id) {
        if (id === 'astro:server-app.js') {
            return this.resolve('astro:server-app')
        }
    },
}

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [tailwindcss(), fixAstroServerApp],
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
    site: 'https://shnam7.github.io',
    base: process.env.NODE_ENV === 'production' ? '/wicle-sites/' : '/',
})
