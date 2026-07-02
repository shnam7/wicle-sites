/**
 * @module MediaQuery
 * @description Responsive media query utilities for breakpoint detection and change events.
 */

import {getViewportSize} from '../util/view.js'

const window = globalThis as Window & typeof globalThis

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type MediaQueryOptions = {
    // no options yet
}

export type BreakPoints = Record<string, number> // first entry value MUST be zeop

// predefined media query break points
export const breakPointsReg: Record<string, BreakPoints> = {
    // screen based states (foundation-site compatible)
    foundation: {
        mini: 0,
        small: 320,
        medium: 640,
        large: 1024,
        xlarge: 1200,
        xxlarge: 1440,
    },

    // device based states (semantic-ui compatible)
    semanticUI: {
        mini: 0,
        phone: 320,
        tablet: 768,
        computer: 992,
        largeMonitor: 1200,
        wideMonitor: 1920,
    },

    // generic states (UIKit compatible)
    uikit: {
        mini: 0,
        small: 480,
        medium: 768,
        large: 960,
        xlarge: 1220,
    },

    // generic states (Bootstrap compatible)
    bootStrap: {
        xs: 0,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
    },

    // minimum form
    simple: {
        mobile: 0,
        computer: 960,
    },

    // normal form: default
    basic: {
        small: 0,
        medium: 768,
        large: 960,
    },

    // tailwindcss form: default
    tailwind: {
        __: 0,
        sm: 640, // 40rem
        md: 768, // 48rem
        lg: 1024, // 64rem
        xl: 1280, // 80rem
        xxl: 1536, // 96rem
    },
}

export type MediaQueryState = {
    state: string // media query(breakpoint) name
    width: number
    prevState: string
    prevWidth: number
    breakPoints: BreakPoints
}

function mqStateOf(width: number, breakPoints: BreakPoints): string {
    let key = ''
    for (key in breakPoints) {
        if (Object.hasOwn(breakPoints, key) && width < (breakPoints[key] ?? 0)) return key
    }

    return key // return last key
}

// start media query change detection service
export function mqStart(breakPoints?: BreakPoints, options?: MediaQueryOptions) {
    breakPoints ??= breakPointsReg.tailwind!
    options = {...options}
    let mqState: MediaQueryState

    // init
    window.addEventListener('mq:init', e => {
        const {width} = getViewportSize()
        const state = mqStateOf(width, breakPoints)
        mqState = {
            state,
            width,
            prevState: state,
            prevWidth: width,
            breakPoints,
        }
    })

    // detect media query changes
    window.addEventListener('resize', e => {
        const {width} = getViewportSize()
        const state = mqStateOf(width, breakPoints)
        if (state !== mqState.state) {
            // console.log(`[window::resize]width=${width}, state=${state}, prevState=${mqState.prevState}`);
            mqState.prevWidth = mqState.width
            mqState.prevState = mqState.state
            mqState.width = width
            mqState.state = state
            window.dispatchEvent(new CustomEvent('mq:change', {detail: mqState}))
        }
    })

    // report current mqState value
    window.addEventListener('mq:report', e => {
        window.dispatchEvent(new CustomEvent('mq:state', {detail: mqState}))
    })

    // trigger initial events
    window.dispatchEvent(new Event('mq:init'))
    window.dispatchEvent(new Event('resize'))
}
