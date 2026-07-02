import pkg from '../package.json' with {type: 'json'}

export * from './ui/offcanvas.js'
export * from './ui/nav.js'
export * from './ui/parallax.js'
export * from './ui/media-query.js'
export * from './util/siblings.js'
export * from './util/view.js'
export * from './util/slider.js'

export function getVersion(): string {
    return pkg.version
}
