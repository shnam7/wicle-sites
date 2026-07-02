/**
 * Offcanvas component.
 *
 * @module Offcanvas
 *
 * @example
 * <section
 *     class="l-site-offcanvas"        // offcanvas class name
 *     data-control=".wz-control"      // name of control button
 *     data-position="left"            // ofcanvas position: left, top, right, bottom
 *     data-width="200px"              // data-height for horizontal canvas
 * >
 *     Offcanvas contents...
 * </section>
 *
 * <button class="w-button wz-control">Button</button> // control button
 */

import {on} from 'node:events'

export type OffcanvasOptions = {
    selector?: string // selector for offcanvas element
    control?: string // selector for open/close control
    position?: string // location of the canvas: left, top, right, bottom
    width?: string // default width of vertical canvas
    height?: string // default height of horizontal canvas
    mode?: string // animation mode. overlay(default) or push
    duration?: number // animation duration
    pusher?: string // selector for element to be pushed on open
    isOpen?: boolean // open/close state,
    closeButton?: boolean
    closeButtonClassName?: string
    autoClose?: boolean
}

type OffcanvasData = Required<OffcanvasOptions>

const defaultCanvasData: OffcanvasData = {
    selector: '.l-site-offcanvas',
    control: '',
    position: 'left',
    width: '320px',
    height: '320px',
    mode: 'overlay',
    duration: 500,
    pusher: '.l-site-container',
    isOpen: false,
    closeButton: true,
    closeButtonClassName: 'offcanvas-close-button',
    autoClose: true,
}

// --- Canvas data - using both WeakMap and element dataset
const canvasDataMap = new WeakMap<HTMLElement, OffcanvasData>()

function getCanvasElementData(canvas: HTMLElement): Partial<OffcanvasData> {
    const {dataset} = canvas
    const data: Partial<OffcanvasData> = {}

    if (dataset.control !== undefined) data.control = dataset.control
    if (dataset.position !== undefined) data.position = dataset.position
    if (dataset.width !== undefined) data.width = dataset.width
    if (dataset.height !== undefined) data.height = dataset.height
    if (dataset.mode !== undefined) data.mode = dataset.mode
    if (dataset.duration !== undefined) data.duration = Number(dataset.duration)
    if (dataset.pusher !== undefined) data.pusher = dataset.pusher
    if (dataset.closeButton !== undefined) data.closeButton = dataset.closeButton === 'true'
    if (dataset.closeButtonClassName !== undefined)
        data.closeButtonClassName = dataset.closeButtonClassName
    if (dataset.autoClose !== undefined) data.autoClose = dataset.autoClose === 'true'

    //  sanity check
    if (Number.isNaN(data.duration)) data.duration = defaultCanvasData.duration

    return data
}

function getCanvasData(canvas: HTMLElement): Required<OffcanvasData> {
    return {...defaultCanvasData, ...canvasDataMap.get(canvas), ...getCanvasElementData(canvas)}
}

function setCanvasData(canvas: HTMLElement, data: Required<OffcanvasData>): void {
    const {dataset} = canvas

    dataset.control &&= data.control
    dataset.position &&= data.position
    dataset.width &&= data.width
    dataset.height &&= data.height
    dataset.mode &&= data.mode
    dataset.duration &&= data.duration.toString()
    dataset.pusher &&= data.pusher
    dataset.closeButton &&= data.closeButton.toString()
    dataset.closeButtonSelector &&= data.closeButtonClassName
    dataset.autoClose &&= data.autoClose.toString()

    canvasDataMap.set(canvas, data)
}

// ----- Helper functions

function applyCss(element: HTMLElement, styles: Record<string, string | number>) {
    Object.assign(element.style, styles)
}

function hideCss(data: OffcanvasData): Record<string, string | number> {
    const pos = data.position
    if (pos === 'left' || pos === 'right')
        return {
            width: data.width,
            height: '100%',
            top: '0',
            left: pos === 'left' ? '0' : 'auto',
            right: pos === 'left' ? 'auto' : '0',
            transform: pos === 'left' ? 'translate3d(-100%, 0, 0)' : 'translate3d(100%, 0, 0)',
        }
    if (pos === 'top' || pos === 'bottom')
        return {
            width: '100%',
            height: data.height,
            left: '0',
            top: pos === 'top' ? '0' : 'auto',
            bottom: pos === 'top' ? 'auto' : '0',
            transform: pos === 'top' ? 'translate3d(0, -100%, 0)' : 'translate3d(0, 100%, 0)',
        }
    return {}
}

function pushCss(data: OffcanvasData): Record<string, string | number> {
    const pos = data.position
    if (pos === 'left') return {transform: `translate3d(${data.width},0,0)`}
    if (pos === 'right') return {transform: `translate3d(-${data.width},0,0)`}
    if (pos === 'top') return {transform: `translate3d(0,${data.height},0)`}
    if (pos === 'bottom') return {transform: `translate3d(0,-${data.height},0)`}
    return {}
}

// --- Event handlers ----------------------------------------

// init
function onInit(e: Event) {
    const canvas = e.target as HTMLElement
    const data = getCanvasData(canvas)

    // init canvas
    applyCss(canvas, {
        ...hideCss(data),
        display: 'block',
        transition: 'transform ' + data.duration / 1000 + 's',
    })

    // init pusher
    const pusher = document.querySelector<HTMLElement>(data.pusher)
    if (pusher) {
        applyCss(pusher, {
            overflowX: 'hidden',
            transition: 'transform ' + data.duration / 1000 + 's',
        })
    }

    // set control button handler
    if (data.control?.length > 0) {
        const controlElements = document.querySelectorAll<HTMLElement>(data.control)

        function onControlClick(err: Event) {
            canvas.dispatchEvent(new Event('offcanvas:toggle'))
        }

        for (const control of controlElements) {
            control.removeEventListener('click', onControlClick)
            control.addEventListener('click', onControlClick)
        }
    }

    // add offcanvas-close-button
    if (data.closeButton) {
        const closeButton = document.createElement('div')
        closeButton.className = data.closeButtonClassName
        canvas.insertBefore(closeButton, canvas.firstChild)

        function onCloseButtonClick(err: Event) {
            err.stopPropagation() // prevent event bubbling
            canvas.dispatchEvent(new Event('offcanvas:close'))
        }

        closeButton.removeEventListener('click', onCloseButtonClick)
        closeButton.addEventListener('click', onCloseButtonClick)
    }

    setCanvasData(canvas, data)
}

// open
function onOpen(e: Event) {
    const canvas = e.target as HTMLElement
    const data = getCanvasData(canvas)

    if (data.isOpen) return

    // trigger opening start notice event
    canvas.dispatchEvent(new Event('offcanvas:opening'))
    applyCss(canvas, {transform: 'translate3d(0, 0, 0)'})

    if (data.mode === 'push') {
        const pusher = document.querySelector<HTMLElement>(data.pusher)
        if (pusher) applyCss(pusher, pushCss(data))
    }

    data.isOpen = true
    setCanvasData(canvas, data)

    // trigger opening completed notice event
    canvas.dispatchEvent(new Event('offcanvas:opened'))
}

// close
function onClose(e: Event) {
    const canvas = e.target as HTMLElement
    const data = getCanvasData(canvas)

    if (!data.isOpen) return

    // trigger closing start notice event
    canvas.dispatchEvent(new Event('offcanvas:closing'))

    if (data.mode === 'push') {
        const pusher = document.querySelector<HTMLElement>(data.pusher)
        if (pusher) applyCss(pusher, {transform: 'none'})
    }

    applyCss(canvas, hideCss(data))

    data.isOpen = false
    setCanvasData(canvas, data)

    // trigger closing completed notice event
    canvas.dispatchEvent(new Event('offcanvas:closed'))
}

// toggle
function onToggle(e: Event) {
    const canvas = e.target as HTMLElement
    const data = getCanvasData(canvas)

    const eventName = data.isOpen ? 'offcanvas:close' : 'offcanvas:open'
    canvas.dispatchEvent(new Event(eventName))
}

export function offcanvas(options: Partial<OffcanvasData> = {}) {
    const canvasElements = document.querySelectorAll<HTMLElement>(
        options.selector ?? defaultCanvasData.selector,
    )
    for (const canvas of canvasElements) {
        canvasDataMap.set(canvas, {
            ...defaultCanvasData,
            ...options,
            ...getCanvasElementData(canvas),
        })

        // Add event listeners
        canvas.addEventListener('offcanvas:init', onInit)
        canvas.addEventListener('offcanvas:open', onOpen)
        canvas.addEventListener('offcanvas:close', onClose)
        canvas.addEventListener('offcanvas:toggle', onToggle)

        // trigger init event
        canvas.dispatchEvent(new Event('offcanvas:init'))
    }

    function autoCloseHandler(e: Event) {
        for (const canvas of canvasElements) {
            const data = getCanvasData(canvas)

            // if control is clicked, do nothing
            const controls = document.querySelectorAll<HTMLElement>(data.control)
            const isControlClicked = [...controls].some(control =>
                control.contains(e.target as Node),
            )

            if (isControlClicked) return

            // if the click is not for control, then execute auto-close logic
            if (data.isOpen && data.autoClose && !canvas.contains(e.target as Node)) {
                canvas.dispatchEvent(new Event('offcanvas:close'))
            }
        }
    }

    globalThis.removeEventListener('click', autoCloseHandler)
    globalThis.addEventListener('click', autoCloseHandler)
}
