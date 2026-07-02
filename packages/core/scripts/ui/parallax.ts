/**
 * Parallax scrolling effect for HTML elements.
 *
 * The Parallax module provides a way to create a parallax scrolling effect for HTML elements.
 * It allows you to define multiple surfaces that move at different speeds relative to the scroll position,
 * creating a sense of depth and motion.
 *
 * @module Parallax
 *
 * @example
 * // Container = [Surface1, Surface2, ...], perspective = 0.5
 * // Surface1 scrolls normally, Surface2 scrolls 50%, Surface3 scrolls 25%, ...
 *
 * @note If the parent node has a 'transform' property, the 'fixed' property of the Surface object will not work.
 * In this case, the Surface will move with the parent and then move again by the scroll handler,
 * causing all surfaces to move faster than the window.
 */

export function isWindow(obj: any): obj is Window {
    return obj instanceof Window || obj === globalThis
}

export class Container {
    private readonly content: HTMLElement | Window
    private readonly surface: Surface[]
    private readonly perspective: number
    private lastPerspective: number

    /**
     * Creates a Container for a Parallax
     *
     * @param scrollableContent The container that will be parallaxed
     * @param perspective The ratio of how much back content should be scrolled
     * relative to forward content. For example, if this value is 0.5, and there are 2 surfaces,
     * the front-most surface would be scrolled normally, and the surface behind it would be scrolled
     * half as much.
     */
    constructor(scrollableContent: HTMLElement | Window, perspective: number) {
        this.content = scrollableContent
        this.surface = []
        this.perspective = perspective
        this.lastPerspective = 1 // perspective of lowest surface

        scrollableContent.addEventListener('scroll', (event: Event) => {
            this.onContainerScroll(event)
        })
    }

    private onContainerScroll(e: Event): void {
        const currentScrollPos = isWindow(this.content)
            ? this.content.scrollY
            : this.content.scrollTop

        for (const surface of this.surface) surface.scroll(-currentScrollPos)
    }

    addSurface(surface: Surface): void {
        if (this.surface.length === 0) {
            // if first surface
            if (surface.perspective <= 0) surface.perspective = 1
        } else {
            if (surface.perspective <= 0) surface.perspective = this.perspective
            surface.perspective *= this.lastPerspective
        }

        this.lastPerspective = surface.perspective
        this.surface.push(surface)
        // console.log(surface, 'perspective=', surface.perspective);
    }
}

export class Surface {
    private readonly content: HTMLElement

    /**
     * Create a Surface for a Palallax
     *
     * @param surfaceContents The HTML element that will be parallaxed
     * @param perspective Initial perspective of the surface.
     * @param cssPosition CSS position property: Should be absolute or fixed
     */
    constructor(
        surfaceContents: HTMLElement,
        public perspective = 0,
        cssPosition = 'fixed',
    ) {
        this.content = surfaceContents
        surfaceContents.style.position = cssPosition
        surfaceContents.style.transform = 'none'
    }

    public scroll(scrollPos: number) {
        this.content.style.transform = `translate3d(0, ${scrollPos * this.perspective}px, 0)`
    }
}

export const Parallax = {Container, Surface}
export default Parallax
