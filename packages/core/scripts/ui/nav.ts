/**
 *  Wicle scripts
 *
 *  @module Nav
 *
 */

// export type MQEventHandler = (nav: Nav, event: CustomEvent<MediaQuery.MQChangeEventData>) => void;

// interface Options { [key: string]: any }
import jQuery from 'jquery'

const window = globalThis as Window & typeof globalThis

export type NavOptions = {
    speed?: number
    showDelay?: number
    hideDelay?: number
    parentLink?: boolean
    singleOpen?: boolean
    breakPoint?: number
}

const dynamicClasses =
    'w-nav,w-nav-item,w-nav-item-wrapper w-nav-parent,w-nav-child,w-nav-divider js-flip, is-active'
const dynamicElements = 'w-nav-parent-marker,w-nav-accordion-click-area'

function onMouseEnterDropdown(e: Event) {
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

export function nav(selector?: string, options: NavOptions = {}) {
    selector ??= '.w-nav'
    options = {
        speed: 200,
        showDelay: 0,
        hideDelay: 0,
        parentLink: false,
        singleOpen: false,
        breakPoint: 640,
        ...options,
    }

    for (const nav of document.querySelectorAll<HTMLElement>(selector)) {
        const $nav = jQuery(nav)

        // init
        nav.addEventListener('nav:init', (e: Event) => {
            const data = (e as CustomEvent<NavOptions>).detail
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
                    itemWithChildren.removeEventListener('mouseenter', onMouseEnterDropdown)
                    itemWithChildren.addEventListener('mouseenter', onMouseEnterDropdown)
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

            const $accordion = $nav.filter('.wo-accordion')
            $accordion
                .find('.w-nav-item-wrapper,.w-nav-accordion-click-area')
                .off('click')
                .on('click', (e, data) => {
                    const opts = options ?? {}
                    const href = e.target.getAttribute('href')

                    // set target to w-nav-parent
                    const $target = jQuery(e.target).parent()
                    const $sub = $target.children('.w-nav-child')
                    const $subAll = $target.find('.w-nav-child')
                    if ($sub.length > 0) {
                        if ($sub.css('display') === 'none') {
                            $sub.slideDown(opts.speed).siblings('a').addClass('is-active')
                            if (opts.singleOpen) {
                                $target
                                    .siblings()
                                    .find('.w-nav-child')
                                    .slideUp(opts.speed)
                                    .end()
                                    .find('a')
                                    .removeClass('is-active')
                            }
                        } else {
                            $subAll
                                .delay(opts.hideDelay ?? 0)
                                .slideUp(opts.speed)
                                .siblings('a')
                                .removeClass('is-active')
                        }
                    }

                    if (opts.parentLink && href) window.location.href = href
                    e.preventDefault()
                    return false
                })

            for (const el of nav.querySelectorAll('.w-state-active')) {
                el.classList.add('is-active')
            }

            window.removeEventListener('resize', flipHandler)
            window.addEventListener('resize', flipHandler)
        })

        $nav.on('nav:clean', (e, data) => {
            // remove dynamic elements
            // eslint-disable-next-line unicorn/no-array-callback-reference
            $nav.find(dynamicElements).remove()

            // remove dynamic classes
            // $nav.find(dynamicClasses).removeClass(dynamicClasses)
            for (const el of nav.querySelectorAll(dynamicClasses)) {
                el.classList.remove(dynamicClasses)
            }

            // remove event handlers
            window.removeEventListener('resize', flipHandler)
            // window.removeEventListener(Nav.mqStateChangedEventName, this.mqChangeHandler);
            $nav.filter('.wo-accordion')
                .find('.w-nav-parent,.w-nav-accordion-click-area')
                .off('click')
        })

        nav.dispatchEvent(new Event('nav:init'))
    }
}
