/**
 *  @package wicle *
 */

// ref: https://andylangton.co.uk/blog/development/get-viewportwindow-size-width-and-height-javascript

export function getViewporSize(): {width: number; height: number} {
    let e: any = globalThis
    let a = 'inner'
    if (!('innerWidth' in globalThis)) {
        a = 'client'
        e = document.documentElement || document.body
    }

    return {width: e[a + 'Width'] as number, height: e[a + 'Height'] as number}
}
