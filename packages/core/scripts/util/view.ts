/**
 * @module View
 * @description Utilities calculating viewport size.
 */

// ref: https://andylangton.co.uk/blog/development/get-viewportwindow-size-width-and-height-javascript
export function getViewportSize(): {width: number; height: number} {
    if ('innerWidth' in globalThis) {
        return {
            width: globalThis.innerWidth,
            height: globalThis.innerHeight,
        }
    }

    const element = document.documentElement ?? document.body
    return {
        width: element.clientWidth,
        height: element.clientHeight,
    }
}
