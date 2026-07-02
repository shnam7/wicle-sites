/**
 * Wicle scripts
 *
 * @module Nav
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

function getNavElementData(navElement: HTMLElement): Partial<NavData> {
    const {dataset} = navElement
    const data: Partial<NavData> = {}

    if (dataset.speed !== undefined) data.speed = Number(dataset.speed)
    if (dataset.parentLink !== undefined) data.parentLink = dataset.parentLink === 'true'
    if (dataset.singleOpen !== undefined) data.singleOpen = dataset.singleOpen === 'true'

    //  sanity check
    if (Number.isNaN(data.speed)) data.speed = defaultNavData.speed

    return data
}

function getNavData(navElement: HTMLElement): NavData {
    return {
        ...defaultNavData,
        speed: 500,
        ...navDataMap.get(navElement),
        ...getNavElementData(navElement),
    }
}

function setNavData(navElement: HTMLElement, data: NavData): void {
    const {dataset} = navElement

    dataset.speed &&= data.speed.toString()
    dataset.parentLink &&= data.parentLink.toString()
    dataset.singleOpen &&= data.singleOpen.toString()

    navDataMap.set(navElement, data)
}

function setBasicClasses(navElement: HTMLElement) {
    // set basic classes
    navElement.classList.add('w-nav')
    for (const el of navElement.querySelectorAll('li')) {
        el.classList.add('w-nav-item')
        const itemWrapper = el.querySelector('a,div')
        if (itemWrapper) {
            itemWrapper.classList.add('w-nav-item-wrapper')
        }
    }
}

function setMultiLevelClasses(navElement: HTMLElement) {
    // set parent/child settings for multi-level menus
    const cl = navElement.classList
    if (cl.contains('wo-dropdown') || cl.contains('wo-default') || cl.contains('wo-accordion')) {
        for (const ul of navElement.querySelectorAll('ul')) {
            ul.classList.add('w-nav-child')
            ul.parentElement?.classList.add('w-nav-parent')
        }
    }
}

function initParentNodes(navElement: HTMLElement) {
    // do not add parent marker for icon-only navs
    if (
        navElement.classList.contains('wo-icon') ||
        navElement.classList.contains('wo-no-parent-marker')
    )
        return

    // set parent nodes for multi-level menus
    const parents = navElement.querySelectorAll<HTMLElement>('.w-nav-parent')
    for (const parent of parents) {
        // parent-marker will not be added to icon-only submenu
        if (!parent.classList.contains('wo-icon')) {
            const itemWrappers = [...parent.children].filter(child =>
                child.classList.contains('w-nav-item-wrapper'),
            )

            for (const wrapper of itemWrappers) {
                // add parent marker when 'wo-icon' not set and the parent market not already exist.
                if (
                    !wrapper.classList.contains('wo-icon') &&
                    !wrapper.querySelector('.w-nav-parent-marker')
                ) {
                    const span = document.createElement('span')
                    span.className = 'w-nav-parent-marker'
                    wrapper.append(span)
                }
            }
        }
    }
}

function handleAccordionClick(target: HTMLElement, navElement: HTMLElement) {
    const data = getNavData(navElement)
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

    if (data.parentLink && href !== null) globalThis.location.assign(href)
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
    // check out-of-viewport status (determine child popup display position)
    const sub = (e.currentTarget as HTMLElement).querySelector('.w-nav-child')
    if (sub) {
        const rect = sub.getBoundingClientRect()
        let flip = ''

        // Check if the element exceeds the horizontal viewport (excluding scrollbars)
        flip = rect.right >= document.body.clientWidth ? 'x' : flip
        flip = flip === '' && rect.left <= 0 ? 'x' : flip

        // Check if the element exceeds the vertical viewport
        flip = rect.bottom >= window.innerHeight ? `${flip}y` : flip

        if (flip !== '') {
            sub.setAttribute('js-flip', flip)
            if (flip.includes('y')) sub.parentElement?.classList.add('js-y-flipped')
        }
    }
}

function onNavInit(e: Event) {
    const navElement = e.currentTarget as HTMLElement
    const data = getNavData(navElement)

    setBasicClasses(navElement)
    setMultiLevelClasses(navElement)
    initParentNodes(navElement)

    const navItems = document.querySelectorAll('.w-nav-item')

    for (const el of navItems) {
        const text = el.textContent?.trim()

        // If text starts with one or more dash-like characters, add the class
        if (text !== '' && /^[\-\u{2013}\u{2014}]+/v.test(text)) {
            el.classList.add('w-nav-divider')
        }
    }

    // --- dropdown settings
    const cl = navElement.classList
    if (cl.contains('wo-dropdown') || cl.contains('wo-default')) {
        for (const itemWithChildren of navElement.querySelectorAll('.w-nav-parent')) {
            itemWithChildren.removeEventListener('mouseenter', onDropdownMouseEnter)
            itemWithChildren.addEventListener('mouseenter', onDropdownMouseEnter)
        }
    }

    // --- accordion settings
    if (cl.contains('wo-accordion')) {
        for (const el of navElement.querySelectorAll<HTMLElement>('.w-nav-item-wrapper')) {
            const hasClickArea = el.querySelector('.w-nav-accordion-click-area')
            if (!hasClickArea) {
                const clickArea = document.createElement('span')
                clickArea.className = 'w-nav-accordion-click-area'
                el.after(clickArea)
            }
        }
    }

    if (navElement.classList.contains('wo-accordion')) {
        // save handle to clean up later in onClean handler
        data.onAccordionClick = (err: Event) => {
            handleAccordionClick(err.target as HTMLElement, navElement)
            err.preventDefault()
        }

        const accordionElements = navElement.querySelectorAll<HTMLElement>(
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

    setNavData(navElement, data)
}

function onNavClean(e: Event) {
    const navElement = e.currentTarget as HTMLElement
    const data = getNavData(navElement)

    // remove event handlers: this should come before removing dynamic elements
    window.removeEventListener('resize', onWindowResize)

    // Remove accordion click handlers
    if (data.onAccordionClick && navElement.classList.contains('wo-accordion')) {
        const accordionElements = navElement.querySelectorAll<HTMLElement>(
            '.w-nav-parent,.w-nav-accordion-click-area',
        )

        for (const el of accordionElements) {
            el.removeEventListener('click', data.onAccordionClick)
        }

        data.onAccordionClick = undefined
    }

    // remove dynamic elements
    for (const selector of dynamicElements) {
        for (const el of navElement.querySelectorAll<HTMLElement>(`.${selector.trim()}`)) {
            el.remove()
        }
    }

    // remove dynamic classes
    for (const className of dynamicClasses) {
        for (const el of navElement.querySelectorAll(`.${className.trim()}`)) {
            el.classList.remove(className.trim())
        }
    }

    setNavData(navElement, data)
}

export function nav(options: NavOptions = {}) {
    const navList = document.querySelectorAll<HTMLElement>(
        options.selector ?? defaultNavData.selector,
    )

    for (const navItem of navList) {
        navDataMap.set(navItem, {...defaultNavData, ...options, ...getNavElementData(navItem)})

        navItem.addEventListener('nav:init', onNavInit)
        navItem.addEventListener('nav:clean', onNavClean)
        navItem.dispatchEvent(new Event('nav:init'))
    }
}
