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
    selector?: string
    speed?: number
    parentLink?: boolean
    singleOpen?: boolean
}

type NavData = Required<NavOptions> & {
    // keep event handlers for use in clean-up
    onAccordionClick?: (e: Event) => void
}

const defaultNavData: NavData = {
    selector: '.w-nav',
    speed: 200,
    parentLink: false,
    singleOpen: false,
}

// --- Canvas data - using both WeakMap and element dataset
const navDataMap = new WeakMap<HTMLElement, NavData>()
const window = globalThis as Window & typeof globalThis
const dynamicClasses = [
    'w-nav',
    'w-nav-item',
    'w-nav-item-wrapper',
    'w-nav-parent',
    'w-nav-child',
    'w-nav-divider',
    'js-flip',
    'js-y-flipped',
    'is-active',
]
const dynamicElements = ['w-nav-parent-marker', 'w-nav-accordion-click-area']

// ----- Helper functions -----------------------------------------------------

function getNavElementData(nav: HTMLElement): Partial<NavData> {
    const {dataset} = nav
    const data: Partial<NavData> = {}

    if (dataset.speed) data.speed = Number.parseInt(dataset.speed, 10)
    if (dataset.parentLink) data.parentLink = dataset.parentLink === 'true'
    if (dataset.singleOpen) data.singleOpen = dataset.singleOpen === 'true'

    //  sanity check
    if (Number.isNaN(data.speed)) data.speed = defaultNavData.speed

    return data
}

function getNavData(nav: HTMLElement): NavData {
    return {...defaultNavData, speed: 500, ...navDataMap.get(nav), ...getNavElementData(nav)}
}

function setNavData(nav: HTMLElement, data: NavData): void {
    const {dataset} = nav

    dataset.speed &&= data.speed.toString()
    dataset.parentLink &&= data.parentLink.toString()
    dataset.singleOpen &&= data.singleOpen.toString()

    navDataMap.set(nav, data)
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
    // do not add parent marker for icon-only navs
    if (nav.classList.contains('wo-icon') || nav.classList.contains('wo-no-parent-marker')) return

    // set parent nodes for multi-level menus
    const parents = nav.querySelectorAll<HTMLElement>('.w-nav-parent')
    for (const parent of parents) {
        // do not add parent-marker for icon-only submenu
        if (parent.classList.contains('wo-icon')) continue

        const itemWrappers = [...parent.children].filter(child =>
            child.classList.contains('w-nav-item-wrapper'),
        )
        for (const wrapper of itemWrappers) {
            // do not add parent marker for specific icon items
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

function handleAccordionClick(target: HTMLElement, nav: HTMLElement) {
    const data = getNavData(nav)
    const href = target.getAttribute('href')

    const targetItem = target.parentElement
    const targetChild = targetItem?.querySelector<HTMLElement>('.w-nav-child')
    // sanity check
    if (!targetItem || !targetChild) {
        console.warn('Invalid target or target child element:', target, targetChild)
        return
    }

    const siblingItems = siblings(targetItem)
    const siblingChildren = [...siblingItems]
        .map(sibling => sibling.querySelector<HTMLElement>('.w-nav-child'))
        .filter(child => child !== null)

    const isHidden = getComputedStyle(targetChild).display === 'none'

    // handle target submenu
    if (isHidden) {
        slideDown(targetChild, data.speed)
        target.classList.add('is-active')
    } else {
        slideUp(targetChild, data.speed)
        target.classList.remove('is-active')
    }

    // handle siblings
    for (const siblingChild of siblingChildren) {
        if (getComputedStyle(siblingChild).display === 'none') continue
        slideUp(siblingChild, data.speed)
        siblingChild.parentElement?.querySelector('a')?.classList.remove('is-active')
    }

    if (data.parentLink && href) globalThis.location.href = href
}

// ----- Event Handlers -------------------------------------------------------

function onWindowResize(_: Event) {
    const flippedElements = document.querySelectorAll('.w-nav [js-flip]')
    for (const el of flippedElements) {
        el.removeAttribute('js-flip')
        el.parentElement?.classList.remove('js-y-flipped')
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
            if (flip.includes('y')) sub.parentElement?.classList.add('js-y-flipped')
        }
    }
}

function onNavInit(e: Event) {
    const nav = e.currentTarget as HTMLElement
    const data = getNavData(nav)

    setBasicClasses(nav)
    setMultiLevelClasses(nav)
    initParentNodes(nav)

    const navItems = document.querySelectorAll('.w-nav-item')

    for (const el of navItems) {
        const text = el.textContent?.trim()

        // If text starts with one or more dash-like characters, add the class
        if (text && /^[-\u2014\u2013]+/.test(text)) {
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
        // save handle to clean up later in onClean handler
        data.onAccordionClick = (e: Event) => {
            handleAccordionClick(e.target as HTMLElement, nav)
            e.preventDefault()
        }

        const accordionElements = nav.querySelectorAll<HTMLElement>(
            '.w-nav-item-wrapper,.w-nav-accordion-click-area',
        )

        // Remove existing click handlers
        for (const el of accordionElements) {
            el.removeEventListener('click', data.onAccordionClick)
            el.addEventListener('click', data.onAccordionClick)
        }
    }

    window.removeEventListener('resize', onWindowResize)
    window.addEventListener('resize', onWindowResize)
    window.removeEventListener('scroll', onWindowResize)
    window.addEventListener('scroll', onWindowResize)

    setNavData(nav, data)
}

function onNavClean(e: Event) {
    const nav = e.currentTarget as HTMLElement
    const data = getNavData(nav)

    // remove event handlers: this should come before removing dynamic elements
    window.removeEventListener('resize', onWindowResize)

    // Remove accordion click handlers
    if (data.onAccordionClick && nav.classList.contains('wo-accordion')) {
        const accordionElements = nav.querySelectorAll<HTMLElement>(
            '.w-nav-parent,.w-nav-accordion-click-area',
        )

        for (const el of accordionElements) {
            el.removeEventListener('click', data.onAccordionClick)
        }

        data.onAccordionClick = undefined
    }

    // remove dynamic elements
    for (const selector of dynamicElements) {
        for (const el of nav.querySelectorAll<HTMLElement>(`.${selector.trim()}`)) {
            el.remove()
        }
    }

    // remove dynamic classes
    for (const className of dynamicClasses) {
        for (const el of nav.querySelectorAll(`.${className.trim()}`)) {
            el.classList.remove(className.trim())
        }
    }

    setNavData(nav, data)
}

export function nav(options: NavOptions = {}) {
    const navList = document.querySelectorAll<HTMLElement>(
        options.selector ?? defaultNavData.selector,
    )

    for (const nav of navList) {
        navDataMap.set(nav, {...defaultNavData, ...options, ...getNavElementData(nav)})

        nav.addEventListener('nav:init', onNavInit)
        nav.addEventListener('nav:clean', onNavClean)
        nav.dispatchEvent(new Event('nav:init'))
    }
}
