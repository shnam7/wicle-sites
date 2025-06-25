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

import jQuery from 'jquery'

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

export function offcanvas(selector?: string, options?: OffcanvasOptions) {
    selector ??= '.l-site-offcanvas'
    const opts: OffcanvasOptions = {
        closeButton: true,
        closeButtonSelector: '.offcanvas-close-button',
        closeOnBackgroundClick: true,
        ...options,
    }

    jQuery(selector).each((index: number, canvas: HTMLElement) => {
        const $canvas = jQuery(canvas)
        const defaultCanvasData: OffcanvasData = {
            control: '',
            position: 'left',
            width: '320px',
            height: '320px',
            mode: 'push',
            duration: 500,
            pusher: '.l-site',
            isOpen: false,
        }

        function hideCss(data: OffcanvasData): JQuery.PlainObject<string | number> {
            const pos = data.position
            if (pos === 'left' || pos === 'right')
                return {
                    width: `${data.width}`,
                    height: '100%',
                    top: 0,
                    left: pos === 'left' ? 0 : 'auto',
                    right: pos === 'left' ? 'auto' : 0,
                    transform: pos === 'left' ? 'translate3d(-100%, 0, 0)' : 'translate3d(100%, 0, 0)',
                }
            if (pos === 'top' || pos === 'bottom')
                return {
                    width: `100%`,
                    height: `${data.height}`,
                    left: 0,
                    top: pos === 'top' ? 0 : 'auto',
                    bottom: pos === 'top' ? 'auto' : 0,
                    transform: pos === 'top' ? 'translate3d(0, -100%, 0)' : 'translate3d(0, 100%, 0)',
                }
            return {}
        }

        function pushCss(data: OffcanvasData): JQuery.PlainObject<string | number> {
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
        $canvas.on('offcanvas:init', (e, defaultData: OffcanvasData) => {
            const data: OffcanvasData = {...defaultData, ...$canvas.data()}
            // console.log('init:data=', data, $canvas);

            $canvas.css(hideCss(data)).css({transition: 'transform ' + data.duration / 1000 + 's'})
            setTimeout(() => {
                $canvas.css({display: 'block'})
            }, 0)

            // set animation timing for pusher
            if (data.mode === 'push')
                jQuery(data.pusher).css({
                    'overflow-x': 'hidden',
                    transition: 'transform ' + data.duration / 1000 + 's',
                })

            // https://reactjs.org/docs/accessibility.html
            // blur event comes first before focus. So, cancel the timer if $canvas is focused
            // This is better than click event because it works for keyboard input too
            let timerId: NodeJS.Timeout
            $canvas.on('blur', () => {
                timerId = setTimeout(() => {
                    $canvas.trigger('offcanvas:close')
                })
            })
            $canvas.on('focus', () => {
                clearTimeout(timerId)
            })

            // set offcanvas control button handler
            if (data.control)
                jQuery(data.control).on('click', e => {
                    $canvas.trigger('offcanvas:toggle')
                    e.preventDefault() // this prevent screen repositioning triggered by <a> tag
                    return false
                })

            // add offcanvas-close-button
            if (opts.closeButton)
                $canvas
                    .prepend("<div class='offcanvas-close-button'></div>")
                    // eslint-disable-next-line unicorn/no-array-callback-reference
                    .find(opts.closeButtonSelector)
                    .on('click', e => {
                        jQuery(data.control).trigger('click')
                        e.preventDefault()
                        return false
                    })

            $canvas.data(data)
            return false
        })

        // open
        $canvas.on('offcanvas:open', e => {
            const data = $canvas.data() as OffcanvasData
            // console.log('open:data=', data);
            if (data.isOpen) return

            $canvas.trigger('offcanvas:opening', [data])
            $canvas.css({transform: 'translate3d(0, 0, 0)'})
            if (data.mode === 'push') jQuery(data.pusher).css(pushCss(data))

            data.isOpen = true
            $canvas.data(data)
            $canvas.trigger('offcanvas:opend', [data])
            return false
        })

        // close
        $canvas.on('offcanvas:close', e => {
            const data = $canvas.data() as OffcanvasData
            if (!data.isOpen) return
            // console.log('close:data=', data);

            $canvas.trigger('offcanvas:closing', [data])
            // transform MUST be 'none' not 'translate3d(0,0,0)'.
            // Or, 'fixed' property of the cheldren will not work, making Parallax not to work
            if (data.mode === 'push') jQuery(data.pusher).css({transform: 'none'})
            $canvas.css(hideCss(data))

            data.isOpen = false
            $canvas.data(data)
            $canvas.trigger('offcanvas:closed', [data])
            return false
        })

        // toggle
        $canvas.on('offcanvas:toggle', e => {
            const data = $canvas.data()
            // console.log('toggle:data=', data, 'offcanvas:' + (data.isOpen ? 'close' : 'open'));
            $canvas.trigger('offcanvas:' + (data.isOpen ? 'close' : 'open'), [data])
            return false
        })

        // trigger init event
        $canvas.trigger('offcanvas:init', [defaultCanvasData])
    })
}
