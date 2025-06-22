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

// ref: https://blog.jiniworld.me/80#a03-1
export function getElementHeight(el?: HTMLElement): number {
    if (!el) return 0
    const c = globalThis.getComputedStyle(el)
    const border = Number.parseFloat(c.borderTopWidth) + Number.parseFloat(c.borderBottomWidth)
    const padding = Number.parseFloat(c.paddingTop) + Number.parseFloat(c.paddingBottom)
    const scrollBar = el.offsetHeight - el.clientHeight - border

    return c.boxSizing === 'border-box' ? el.offsetHeight - border - padding : el.offsetHeight - border - padding - scrollBar
}
