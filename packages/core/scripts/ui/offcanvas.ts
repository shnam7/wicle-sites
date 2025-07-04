/**
 * @package wicle
 *
 * @usage
 * 	<section
 * 		class="l-site-offcanvas"		// offcanvas class name
 * 		data-control=".wz-control"		// name of control button
 * 		data-position="left"			// ofcanvas position: left, top, right, bottom
 * 		data-width="200px"				// data-height for horizontal canvas
 * 	>
 * 		Offcanvas contents...
 * 	</section>
 *
 *	<button class="w-button wz-control">Button</button>	// control button
 */

export type OffcanvasOptions = {
    closeButton: boolean
    closeButtonSelector: string
    closeOnBackgroundClick: boolean
}

type OffcanvasData = {
    control: string // selector for open/close control
    position: string // location of the canvas: left, top, right, bottom
    width: string // default width of vertical canvas
    height: string // default height of horizontal canvas
    mode: string // animation mode. overlay(default) or push
    duration: number // animation duration
    pusher: string // selector for element to be pushed on open
    isOpen: boolean // open/close state
}

// WeakMap for storing element data (replaces jQuery data())
const canvasDataMap = new WeakMap<HTMLElement, OffcanvasData>()

// Helper functions
function applyCss(element: HTMLElement, styles: Record<string, string | number>) {
    Object.assign(element.style, styles)
}

function dispatchCustomEvent(element: HTMLElement, eventName: string, data?: OffcanvasData) {
    const event = new CustomEvent(eventName, {detail: data})
    element.dispatchEvent(event)
}

function getElementData(element: HTMLElement): Partial<OffcanvasData> {
    const {dataset} = element
    const data: Partial<OffcanvasData> = {}

    if (dataset.control) data.control = dataset.control
    if (dataset.position) data.position = dataset.position
    if (dataset.width) data.width = dataset.width
    if (dataset.height) data.height = dataset.height
    if (dataset.mode) data.mode = dataset.mode
    if (dataset.duration) data.duration = Number.parseInt(dataset.duration, 10)
    if (dataset.pusher) data.pusher = dataset.pusher

    return data
}

export function offcanvas(selector?: string, options?: OffcanvasOptions) {
    selector ??= '.l-site-offcanvas'
    const opts: OffcanvasOptions = {
        closeButton: true,
        closeButtonSelector: '.offcanvas-close-button',
        closeOnBackgroundClick: true,
        ...options,
    }

    const canvasElements = document.querySelectorAll<HTMLElement>(selector)

    for (const canvas of canvasElements) {
        const defaultCanvasData: OffcanvasData = {
            control: '',
            position: 'left',
            width: '320px',
            height: '320px',
            mode: 'overlay',
            duration: 500,
            pusher: '.l-site-container',
            isOpen: false,
        }

        function hideCss(data: OffcanvasData): Record<string, string | number> {
            const pos = data.position
            if (pos === 'left' || pos === 'right')
                return {
                    width: `${data.width}`,
                    height: '100%',
                    top: '0',
                    left: pos === 'left' ? '0' : 'auto',
                    right: pos === 'left' ? 'auto' : '0',
                    transform:
                        pos === 'left' ? 'translate3d(-100%, 0, 0)' : 'translate3d(100%, 0, 0)',
                }
            if (pos === 'top' || pos === 'bottom')
                return {
                    width: '100%',
                    height: `${data.height}`,
                    left: '0',
                    top: pos === 'top' ? '0' : 'auto',
                    bottom: pos === 'top' ? 'auto' : '0',
                    transform:
                        pos === 'top' ? 'translate3d(0, -100%, 0)' : 'translate3d(0, 100%, 0)',
                }
            return {}
        }

        function pushCss(data: OffcanvasData): Record<string, string | number> {
            if (data.mode !== 'push') return {}

            const pos = data.position
            if (pos === 'left') return {transform: 'translate3d(' + data.width + ',0,0)'}
            if (pos === 'right') return {transform: 'translate3d(-' + data.width + ',0,0)'}
            if (pos === 'top') return {transform: 'translate3d(0,' + data.height + ',0)'}
            if (pos === 'bottom') return {transform: 'translate3d(0,-' + data.height + ',0)'}
            return {}
        }

        // --- Event handlers ----------------------------------------

        // init
        function onInit(e: CustomEvent<OffcanvasData>) {
            const data: OffcanvasData = {...e.detail, ...getElementData(canvas)}

            applyCss(canvas, hideCss(data))
            applyCss(canvas, {transition: 'transform ' + data.duration / 1000 + 's'})

            setTimeout(() => {
                applyCss(canvas, {display: 'block'})
            }, 0)

            // set animation timing for pusher
            if (data.mode === 'push') {
                const pusher = document.querySelector<HTMLElement>(data.pusher)
                if (pusher) {
                    applyCss(pusher, {
                        overflowX: 'hidden',
                        transition: 'transform ' + data.duration / 1000 + 's',
                    })
                }
            }

            // Focus/blur handlers for accessibility
            let timerId: NodeJS.Timeout
            canvas.addEventListener('blur', () => {
                timerId = setTimeout(() => {
                    dispatchCustomEvent(canvas, 'offcanvas:close')
                })
            })
            canvas.addEventListener('focus', () => {
                clearTimeout(timerId)
            })

            // set offcanvas control button handler
            if (data.control) {
                const controlElements = document.querySelectorAll<HTMLElement>(data.control)
                for (const control of controlElements) {
                    control.addEventListener('click', e => {
                        dispatchCustomEvent(canvas, 'offcanvas:toggle')
                        e.preventDefault()
                    })
                }
            }

            // add offcanvas-close-button
            if (opts.closeButton) {
                const closeButton = document.createElement('div')
                closeButton.className = 'offcanvas-close-button'
                canvas.insertBefore(closeButton, canvas.firstChild)

                const closeButtons = canvas.querySelectorAll<HTMLElement>(opts.closeButtonSelector)
                for (const btn of closeButtons) {
                    btn.addEventListener('click', e => {
                        const controlElements = document.querySelectorAll<HTMLElement>(data.control)
                        for (const control of controlElements) control.click()
                        e.preventDefault()
                    })
                }
            }

            canvasDataMap.set(canvas, data)
        }

        // open
        function onOpen(e: CustomEvent<OffcanvasData>) {
            const data = canvasDataMap.get(canvas)
            if (!data || data.isOpen) return

            dispatchCustomEvent(canvas, 'offcanvas:opening', data)
            applyCss(canvas, {transform: 'translate3d(0, 0, 0)'})

            if (data.mode === 'push') {
                const pusher = document.querySelector<HTMLElement>(data.pusher)
                if (pusher) applyCss(pusher, pushCss(data))
            }

            data.isOpen = true
            canvasDataMap.set(canvas, data)
            dispatchCustomEvent(canvas, 'offcanvas:opened', data)
        }

        // close
        function onClose(e: CustomEvent<OffcanvasData>) {
            const data = canvasDataMap.get(canvas)
            if (!data?.isOpen) return

            dispatchCustomEvent(canvas, 'offcanvas:closing', data)

            if (data.mode === 'push') {
                const pusher = document.querySelector<HTMLElement>(data.pusher)
                if (pusher) applyCss(pusher, {transform: 'none'})
            }

            applyCss(canvas, hideCss(data))

            data.isOpen = false
            canvasDataMap.set(canvas, data)
            dispatchCustomEvent(canvas, 'offcanvas:closed', data)
        }

        // toggle
        function onToggle(e: CustomEvent<OffcanvasData>) {
            const data = canvasDataMap.get(canvas)
            if (!data) return

            const eventName = data.isOpen ? 'offcanvas:close' : 'offcanvas:open'
            dispatchCustomEvent(canvas, eventName, data)
        }

        // change mode
        function onChangeMode(e: CustomEvent<{mode: string}>) {
            const data = canvasDataMap.get(canvas)
            if (!data) return

            const newMode = e.detail.mode
            if (newMode !== 'overlay' && newMode !== 'push') {
                console.warn(
                    `Invalid offcanvas mode: ${newMode}. Valid modes are 'overlay' or 'push'.`,
                )
                return
            }

            // If canvas is open, close it first
            const wasOpen = data.isOpen
            if (wasOpen) {
                dispatchCustomEvent(canvas, 'offcanvas:close', data)
            }

            // Update mode
            data.mode = newMode
            canvasDataMap.set(canvas, data)

            // Update pusher transition settings
            const pusher = document.querySelector<HTMLElement>(data.pusher)
            if (pusher) {
                if (newMode === 'push') {
                    applyCss(pusher, {
                        overflowX: 'hidden',
                        transition: 'transform ' + data.duration / 1000 + 's',
                    })
                } else {
                    applyCss(pusher, {
                        overflowX: '',
                        transition: '',
                        transform: 'none',
                    })
                }
            }

            // Dispatch mode changed event
            dispatchCustomEvent(canvas, 'offcanvas:mode-changed', data)

            // Reopen if it was open before
            if (wasOpen) {
                dispatchCustomEvent(canvas, 'offcanvas:open', data)
            }
        }

        // Add event listeners
        canvas.addEventListener('offcanvas:init', onInit as EventListener)
        canvas.addEventListener('offcanvas:open', onOpen as EventListener)
        canvas.addEventListener('offcanvas:close', onClose as EventListener)
        canvas.addEventListener('offcanvas:toggle', onToggle as EventListener)
        canvas.addEventListener('offcanvas:change-mode', onChangeMode as EventListener)

        // trigger init event
        dispatchCustomEvent(canvas, 'offcanvas:init', defaultCanvasData)
    }
}
