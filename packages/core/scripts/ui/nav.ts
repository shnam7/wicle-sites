/**
 *  Wicle scripts
 *
 *  @module Nav
 *
 */

// export type MQEventHandler = (nav: Nav, event: CustomEvent<MediaQuery.MQChangeEventData>) => void;

// interface Options { [key: string]: any }
import {slideDown, slideUp} from '../util/slider.js'
import {siblings} from '../util/siblings.js'

export type NavOptions = {
    speed?: number
    showDelay?: number
    hideDelay?: number
    parentLink?: boolean
    singleOpen?: boolean
    breakPoint?: number
}

type NavConfig = {
    selector: string
    options: NavOptions
}

const window = globalThis as Window & typeof globalThis
const conf: NavConfig = {
    selector: '.w-nav',
    options: {
        speed: 200,
        showDelay: 0,
        hideDelay: 0,
        parentLink: false,
        singleOpen: false,
        breakPoint: 640,
    },
}

const dynamicClasses =
    'w-nav,w-nav-item,w-nav-item-wrapper w-nav-parent,w-nav-child,w-nav-divider js-flip, is-active'
const dynamicElements = 'w-nav-parent-marker,w-nav-accordion-click-area'

function flipHandler(e: Event) {
    const flippedElements = document.querySelectorAll('.w-nav [js-flip]')
    for (const el of flippedElements) {
        el.removeAttribute('js-flip')
    }
}

function setBasicClasses(nav: HTMLElement) {
    // set basic classes
    nav.classList.add('w-nav')
    for (const el of nav.querySelectorAll('li')) {
        el.classList.add('w-nav-item')
        const itemWrapper = el.querySelector('a,div')
        if (itemWrapper) {
            itemWrapper.classList.add('w-nav-item-wrapper')
        }
    }
}

function setMultiLevelClasses(nav: HTMLElement) {
    // set parent/child settings for multi-level menus
    const cl = nav.classList
    if (cl.contains('wo-dropdown') || cl.contains('wo-default') || cl.contains('wo-accordion')) {
        for (const ul of nav.querySelectorAll('ul')) {
            ul.classList.add('w-nav-child')
            ul.parentElement?.classList.add('w-nav-parent')
        }
    }
}

function initParentNodes(nav: HTMLElement) {
    // set parent nodes for multi-level menus
    const parents = nav.querySelectorAll<HTMLElement>('.w-nav-parent')
    for (const parent of parents) {
        if (parent.classList.contains('wo-icon')) continue

        const itemWrappers = [...parent.children].filter(child =>
            child.classList.contains('w-nav-item-wrapper'),
        )
        for (const wrapper of itemWrappers) {
            if (wrapper.classList.contains('wo-icon')) continue

            const hasMarker = wrapper.querySelector('.w-nav-parent-marker')
            if (!hasMarker) {
                const span = document.createElement('span')
                span.className = 'w-nav-parent-marker'
                wrapper.append(span)
            }
        }
    }
}

// --- event handlers
function onNavInit(e: Event) {
    const nav = e.currentTarget as HTMLElement
    const options = (e as CustomEvent<NavOptions>).detail
    // Use the data here...

    setBasicClasses(nav)
    setMultiLevelClasses(nav)
    initParentNodes(nav)

    const navItems = document.querySelectorAll('.w-nav-item')

    for (const el of navItems) {
        const text = el.textContent?.trim() ?? ''

        // If text starts with one or more dash-like characters, add the class
        if (/^[-\u2014\u2013]+/.test(text)) {
            el.classList.add('w-nav-divider')
        }
    }

    // --- dropdown settings
    const cl = nav.classList
    if (cl.contains('wo-dropdown') || cl.contains('wo-default')) {
        for (const itemWithChildren of nav.querySelectorAll('.w-nav-parent')) {
            itemWithChildren.removeEventListener('mouseenter', onDropdownMouseEnter)
            itemWithChildren.addEventListener('mouseenter', onDropdownMouseEnter)
        }
    }

    // --- accordion settings
    if (cl.contains('wo-accordion')) {
        for (const el of nav.querySelectorAll<HTMLElement>('.w-nav-item-wrapper')) {
            const hasClickArea = el.querySelector('.w-nav-accordion-click-area')
            if (!hasClickArea) {
                const clickArea = document.createElement('span')
                clickArea.className = 'w-nav-accordion-click-area'
                el.after(clickArea)
            }
        }
    }

    if (nav.classList.contains('wo-accordion')) {
        const accordionElements = nav.querySelectorAll<HTMLElement>(
            '.w-nav-item-wrapper,.w-nav-accordion-click-area',
        )

        // Remove existing click handlers
        for (const el of accordionElements) {
            el.removeEventListener('click', onAccordionClick)
            el.addEventListener('click', onAccordionClick)
        }
    }

    for (const el of nav.querySelectorAll('.w-state-active')) {
        el.classList.add('is-active')
    }
    // }

    window.removeEventListener('resize', flipHandler)
    window.addEventListener('resize', flipHandler)
}

function onNavClean(e: Event) {
    const nav = e.currentTarget as HTMLElement

    // remove dynamic elements
    const dynamicElementSelectors = dynamicElements.split(',')
    for (const selector of dynamicElementSelectors) {
        for (const el of nav.querySelectorAll<HTMLElement>(`.${selector.trim()}`)) {
            el.remove()
        }
    }

    // remove dynamic classes
    const dynamicClassList = dynamicClasses.split(',')
    for (const className of dynamicClassList) {
        for (const el of nav.querySelectorAll(`.${className.trim()}`)) {
            el.classList.remove(className.trim())
        }
    }

    // remove event handlers
    window.removeEventListener('resize', flipHandler)

    // Remove accordion click handlers
    if (nav.classList.contains('wo-accordion')) {
        const accordionElements = nav.querySelectorAll<HTMLElement>(
            '.w-nav-parent,.w-nav-accordion-click-area',
        )
        for (const el of accordionElements) {
            el.removeEventListener('click', onAccordionClick)
        }
    }
}

function onDropdownMouseEnter(e: Event) {
    // check out-of-viewport status (determine child popup dipslay position)
    const sub = (e.currentTarget as HTMLElement).querySelector('.w-nav-child')
    if (sub) {
        const rect = sub.getBoundingClientRect()
        let flip = ''

        // Check if the element exceeds the horizontal viewport (excluding scrollbars)
        if (rect.right >= document.body.clientWidth) flip = 'x'

        // Check if the element exceeds the vertical viewport
        if (rect.bottom >= window.innerHeight) flip += 'y'

        if (flip) {
            sub.setAttribute('js-flip', flip)
        }
    }
}

function onAccordionClick(e: Event) {
    const target = e.target as HTMLElement
    const opts = conf.options
    const href = target.getAttribute('href')

    // set target to w-nav-parent
    const parent = target.parentElement!
    const sub = parent.querySelector<HTMLElement>('.w-nav-child')
    const subAll = parent.querySelectorAll<HTMLElement>('.w-nav-child')

    if (sub) {
        const isHidden = getComputedStyle(sub).display === 'none'

        if (isHidden) {
            slideDown(sub, opts.speed)
            const sibling = parent.querySelector('a')
            if (sibling) sibling.classList.add('is-active')

            if (opts.singleOpen) {
                for (const sibling of siblings(parent.parentElement!)) {
                    const siblingChild = sibling.querySelector<HTMLElement>('.w-nav-child')
                    slideUp(siblingChild ?? undefined, opts.speed)
                    sibling.querySelector('a')?.classList.remove('is-active')
                }
            }
        } else {
            setTimeout(() => {
                for (const el of subAll) slideUp(el, opts.speed)
                parent.querySelector('a')?.classList.remove('is-active')
            }, opts.hideDelay ?? 0)
        }
    }

    if (opts.parentLink && href) window.location.href = href
    e.preventDefault()
    return false
}

export function nav(selector?: string, options: NavOptions = {}) {
    if (selector) conf.selector = selector
    for (const nav of document.querySelectorAll<HTMLElement>(conf.selector)) {
        nav.addEventListener('nav:init', onNavInit)
        nav.addEventListener('nav:clean', onNavClean)
        nav.dispatchEvent(new CustomEvent<NavOptions>('nav:init', {detail: options}))
    }
}
