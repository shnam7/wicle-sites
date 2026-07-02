import {beforeEach, afterEach, describe, expect, it, vi} from 'vitest'
import {offcanvas, type OffcanvasOptions} from '../../scripts/ui/offcanvas.js'

describe('offcanvas', () => {
    let container: HTMLElement
    let mockCanvas: HTMLElement
    let mockControl: HTMLElement
    let mockPusher: HTMLElement

    beforeEach(() => {
        vi.useFakeTimers()

        // Setup DOM
        document.body.innerHTML = ''
        container = document.createElement('div')
        document.body.append(container)

        // Create mock canvas
        mockCanvas = document.createElement('section')
        mockCanvas.className = 'l-site-offcanvas'
        mockCanvas.dataset.control = '.wz-control'
        mockCanvas.dataset.position = 'left'
        mockCanvas.dataset.width = '300px'
        mockCanvas.dataset.mode = 'overlay'
        mockCanvas.dataset.pusher = '.l-site-container'
        mockCanvas.innerHTML = '<div>Offcanvas Content</div>'

        // Create mock control button
        mockControl = document.createElement('button')
        mockControl.className = 'w-button wz-control'
        mockControl.textContent = 'Toggle'

        // Create mock pusher
        mockPusher = document.createElement('div')
        mockPusher.className = 'l-site-container'
        mockPusher.innerHTML = '<div>Main Content</div>'

        container.append(mockPusher)
        container.append(mockControl)
        container.append(mockCanvas)
    })

    afterEach(() => {
        vi.runAllTimers()
        vi.restoreAllMocks()
    })

    describe('initialization', () => {
        it('should initialize offcanvas with default selector', () => {
            const dispatchSpy = vi.spyOn(mockCanvas, 'dispatchEvent')

            offcanvas()

            expect(dispatchSpy).toHaveBeenCalledWith(
                expect.objectContaining({type: 'offcanvas:init'}),
            )
        })

        it('should initialize with custom selector', () => {
            mockCanvas.className = 'custom-offcanvas'
            const dispatchSpy = vi.spyOn(mockCanvas, 'dispatchEvent')

            offcanvas({selector: '.custom-offcanvas'})

            expect(dispatchSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'offcanvas:init',
                }),
            )
        })

        it('should apply default CSS styles on init', () => {
            offcanvas()

            expect(mockCanvas.style.display).toBe('block')
            expect(mockCanvas.style.transform).toBe('translate3d(-100%, 0, 0)')
            expect(mockCanvas.style.transition).toContain('transform')
        })

        it('should setup pusher element', () => {
            offcanvas()

            expect(mockPusher.style.overflowX).toBe('hidden')
            expect(mockPusher.style.transition).toContain('transform')
        })

        it('should add close button when closeButton is true by default', () => {
            offcanvas()

            const closeButton = mockCanvas.querySelector('.offcanvas-close-button')
            expect(closeButton).toBeTruthy()
        })

        it('should set close button class name through offcanvas options', () => {
            // mockCanvas.dataset.closeButtonClassName = 'custom-close-button'
            offcanvas({closeButton: true, closeButtonClassName: 'custom-close-button'})

            const closeButton = mockCanvas.querySelector('.custom-close-button')
            expect(closeButton).toBeTruthy()
        })

        it('should set close button class name through dataset', () => {
            mockCanvas.dataset.closeButtonClassName = 'custom-close-button1'
            offcanvas()

            const closeButton = mockCanvas.querySelector('.custom-close-button1')
            expect(closeButton).toBeTruthy()
        })

        it('should not add close button when closeButton is false', () => {
            mockCanvas.dataset.closeButton = 'false'
            offcanvas()

            const closeButton = mockCanvas.querySelector('.offcanvas-close-button')
            expect(closeButton).toBeFalsy()
        })

        it('should setup control button event listener', () => {
            const dispatchSpy = vi.spyOn(mockCanvas, 'dispatchEvent')
            offcanvas()

            mockControl.click()

            expect(dispatchSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'offcanvas:toggle',
                }),
            )
        })

        it('should handle missing control and pusher gracefully', () => {
            mockCanvas.dataset.control = '.not-exist'
            mockCanvas.dataset.pusher = '.not-exist'
            expect(() => {
                offcanvas()
            }).not.toThrow()
        })
    })

    describe('position handling', () => {
        it('should handle left position', () => {
            mockCanvas.dataset.position = 'left'
            offcanvas()

            expect(mockCanvas.style.left).toBe('0px')
            expect(mockCanvas.style.transform).toBe('translate3d(-100%, 0, 0)')
        })

        it('should handle right position', () => {
            mockCanvas.dataset.position = 'right'
            offcanvas()

            expect(mockCanvas.style.right).toBe('0px')
            expect(mockCanvas.style.transform).toBe('translate3d(100%, 0, 0)')
        })

        it('should handle top position', () => {
            mockCanvas.dataset.position = 'top'
            mockCanvas.dataset.height = '200px'
            offcanvas()

            expect(mockCanvas.style.top).toBe('0px')
            expect(mockCanvas.style.transform).toBe('translate3d(0, -100%, 0)')
        })

        it('should handle bottom position', () => {
            mockCanvas.dataset.position = 'bottom'
            mockCanvas.dataset.height = '200px'
            offcanvas()

            expect(mockCanvas.style.bottom).toBe('0px')
            expect(mockCanvas.style.transform).toBe('translate3d(0, 100%, 0)')
        })

        it('should handle invalid position', () => {
            mockCanvas.dataset.position = 'invalid'
            offcanvas()
            expect(mockCanvas.style.transform).toBe('')
        })
    })

    describe('open/close functionality', () => {
        beforeEach(() => {
            offcanvas()
        })

        it('should open offcanvas', async () => {
            const openingSpy = vi.fn<(event: Event) => void>()
            const openedSpy = vi.fn<(event: Event) => void>()
            mockCanvas.addEventListener('offcanvas:opening', openingSpy)
            mockCanvas.addEventListener('offcanvas:opened', openedSpy)

            const openEvent = new CustomEvent('offcanvas:open')
            mockCanvas.dispatchEvent(openEvent)

            await vi.waitFor(() => {
                expect(openingSpy).toHaveBeenCalled()
                expect(openedSpy).toHaveBeenCalled()
                expect(mockCanvas.style.transform).toBe('translate3d(0, 0, 0)')
            })
        })

        it('should close offcanvas', async () => {
            // First open
            const openEvent = new CustomEvent('offcanvas:open')
            mockCanvas.dispatchEvent(openEvent)

            await vi.waitFor(() => {
                expect(mockCanvas.style.transform).toBe('translate3d(0, 0, 0)')
            })

            const closingSpy = vi.fn<(event: Event) => void>()
            const closedSpy = vi.fn<(event: Event) => void>()
            mockCanvas.addEventListener('offcanvas:closing', closingSpy)
            mockCanvas.addEventListener('offcanvas:closed', closedSpy)

            // Then close
            const closeEvent = new CustomEvent('offcanvas:close')
            mockCanvas.dispatchEvent(closeEvent)

            await vi.waitFor(() => {
                expect(closingSpy).toHaveBeenCalled()
                expect(closedSpy).toHaveBeenCalled()
                expect(mockCanvas.style.transform).toBe('translate3d(-100%, 0, 0)')
            })
        })

        it('should toggle offcanvas', async () => {
            // Initial state is closed, so toggle should open
            const toggleEvent = new CustomEvent('offcanvas:toggle')
            mockCanvas.dispatchEvent(toggleEvent)

            await vi.waitFor(() => {
                expect(mockCanvas.style.transform).toBe('translate3d(0, 0, 0)')
            })

            // Toggle again should close
            mockCanvas.dispatchEvent(toggleEvent)

            await vi.waitFor(() => {
                expect(mockCanvas.style.transform).toBe('translate3d(-100%, 0, 0)')
            })
        })

        it('should not open if already open', () => {
            const openingSpy = vi.fn<(event: Event) => void>()
            mockCanvas.addEventListener('offcanvas:opening', openingSpy)

            // Open first time
            const openEvent = new CustomEvent('offcanvas:open')
            mockCanvas.dispatchEvent(openEvent)
            expect(openingSpy).toHaveBeenCalledTimes(1)

            // Try to open again
            mockCanvas.dispatchEvent(openEvent)
            expect(openingSpy).toHaveBeenCalledTimes(1) // Should not be called again
        })

        it('should not close if already closed', () => {
            const closingSpy = vi.fn<(event: Event) => void>()
            mockCanvas.addEventListener('offcanvas:closing', closingSpy)

            // Try to close when already closed
            const closeEvent = new CustomEvent('offcanvas:close')
            mockCanvas.dispatchEvent(closeEvent)

            expect(closingSpy).not.toHaveBeenCalled()
        })
    })
    describe('push mode', () => {
        beforeEach(() => {
            mockCanvas.dataset.mode = 'push'
        })

        it('should move pusher when opening in push mode', async () => {
            offcanvas()
            const openEvent = new CustomEvent('offcanvas:open')
            mockCanvas.dispatchEvent(openEvent)

            await vi.waitFor(() => {
                expect(mockPusher.style.transform).toBe('translate3d(300px,0,0)')
            })
        })

        it('should reset pusher when closing in push mode', async () => {
            offcanvas()

            // Open first
            const openEvent = new CustomEvent('offcanvas:open')
            mockCanvas.dispatchEvent(openEvent)

            await vi.waitFor(() => {
                expect(mockPusher.style.transform).toBe('translate3d(300px,0,0)')
            })

            // Then close
            const closeEvent = new CustomEvent('offcanvas:close')
            mockCanvas.dispatchEvent(closeEvent)

            await vi.waitFor(() => {
                expect(mockPusher.style.transform).toBe('none')
            })
        })

        it('should handle push mode for right position', async () => {
            mockCanvas.dataset.position = 'right'
            offcanvas()

            const openEvent = new CustomEvent('offcanvas:open')
            mockCanvas.dispatchEvent(openEvent)

            await vi.waitFor(() => {
                expect(mockPusher.style.transform).toBe('translate3d(-300px,0,0)')
            })
        })

        it('should handle push mode for top position', async () => {
            mockCanvas.dataset.position = 'top'
            mockCanvas.dataset.height = '200px'
            offcanvas()

            mockCanvas.dispatchEvent(new Event('offcanvas:open'))

            await vi.waitFor(() => {
                expect(mockPusher.style.transform).toBe('translate3d(0,200px,0)')
            })
        })

        it('should handle push mode for bottom position', async () => {
            mockCanvas.dataset.position = 'bottom'
            mockCanvas.dataset.height = '200px'
            offcanvas()

            const openEvent = new CustomEvent('offcanvas:open')
            mockCanvas.dispatchEvent(openEvent)

            await vi.waitFor(() => {
                expect(mockPusher.style.transform).toBe('translate3d(0,-200px,0)')
            })
        })

        it('should not move pusher for invalid position', async () => {
            mockCanvas.dataset.position = 'invalid'
            offcanvas()

            const openEvent = new CustomEvent('offcanvas:open')
            mockCanvas.dispatchEvent(openEvent)

            expect(mockPusher.style.transform).toBe('')
        })
    })

    describe('auto-close functionality', () => {
        beforeEach(() => {
            mockCanvas.dataset.autoClose = 'true'
            offcanvas()
        })

        it('should close offcanvas when clicking outside the canvas', async () => {
            // Open the offcanvas
            const openEvent = new CustomEvent('offcanvas:open')
            mockCanvas.dispatchEvent(openEvent)

            await vi.waitFor(() => {
                expect(mockCanvas.style.transform).toBe('translate3d(0, 0, 0)')
            })

            // Simulate click outside the canvas
            const outsideClickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
            })
            document.body.dispatchEvent(outsideClickEvent)

            await vi.waitFor(() => {
                expect(mockCanvas.style.transform).toBe('translate3d(-100%, 0, 0)')
            })
        })

        it('should not close offcanvas when clicking inside the canvas', async () => {
            // Open the offcanvas
            const openEvent = new CustomEvent('offcanvas:open')
            mockCanvas.dispatchEvent(openEvent)

            await vi.waitFor(() => {
                expect(mockCanvas.style.transform).toBe('translate3d(0, 0, 0)')
            })

            // Simulate click inside the canvas
            const insideClickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
            })
            mockCanvas.dispatchEvent(insideClickEvent)

            await vi.waitFor(() => {
                expect(mockCanvas.style.transform).toBe('translate3d(0, 0, 0)')
            })
        })

        it('should not close offcanvas when clicking on control button', async () => {
            // Open the offcanvas
            const openEvent = new CustomEvent('offcanvas:open')
            mockCanvas.dispatchEvent(openEvent)

            await vi.waitFor(() => {
                expect(mockCanvas.style.transform).toBe('translate3d(0, 0, 0)')
            })

            // Simulate click on control button
            const controlClickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
            })
            mockControl.dispatchEvent(controlClickEvent)

            // canvas should have ben closed by control click event handler
            await vi.waitFor(() => {
                expect(mockCanvas.style.transform).toBe('translate3d(-100%, 0, 0)')
            })
        })
    })

    describe('custom defaults', () => {
        it('should apply custom defaults', () => {
            const customDefaults: Partial<OffcanvasOptions> = {
                selector: '.l-site-offcanvas',
                mode: 'push',
                duration: 1000,
                position: 'right',
            }

            offcanvas(customDefaults)

            expect(mockCanvas.style.transition).toContain('1s')
            expect(mockPusher.style.transition).toContain('1s')
        })

        it('should override defaults with data attributes', () => {
            mockCanvas.dataset.width = '500px'
            mockCanvas.dataset.duration = '2000'
            const customDefaults: Partial<OffcanvasOptions> = {
                selector: '.l-site-offcanvas',
                width: '400px',
                duration: 1000,
            }
            offcanvas(customDefaults)
            expect(mockCanvas.style.width).toBe('500px')
            expect(mockCanvas.style.transition).toContain('2s')
        })
    })

    describe('multiple canvases', () => {
        it('should handle multiple offcanvas elements', () => {
            const secondCanvas = document.createElement('section')
            secondCanvas.className = 'l-site-offcanvas'
            secondCanvas.dataset.control = '.wz-control-2'
            secondCanvas.dataset.position = 'right'
            container.append(secondCanvas)

            const dispatchSpy1 = vi.spyOn(mockCanvas, 'dispatchEvent')
            const dispatchSpy2 = vi.spyOn(secondCanvas, 'dispatchEvent')

            offcanvas()

            expect(dispatchSpy1).toHaveBeenCalledWith(
                expect.objectContaining({type: 'offcanvas:init'}),
            )
            expect(dispatchSpy2).toHaveBeenCalledWith(
                expect.objectContaining({type: 'offcanvas:init'}),
            )
        })

        it('should handle multiple control buttons for same canvas', () => {
            const secondControl = document.createElement('button')
            secondControl.className = 'w-button wz-control'
            secondControl.textContent = 'Toggle 2'
            container.append(secondControl)

            const dispatchSpy = vi.spyOn(mockCanvas, 'dispatchEvent')
            offcanvas()

            mockControl.click()
            secondControl.click()
            expect(dispatchSpy).toHaveBeenCalledWith(
                expect.objectContaining({type: 'offcanvas:toggle'}),
            )
        })
    })

    describe('data attributes', () => {
        it('should read configuration from data attributes', () => {
            mockCanvas.dataset.width = '400px'
            mockCanvas.dataset.duration = '800'
            mockCanvas.dataset.mode = 'push'

            offcanvas()

            expect(mockCanvas.style.width).toBe('400px')
            expect(mockCanvas.style.transition).toContain('0.8s')
        })
    })

    describe('close button functionality', () => {
        beforeEach(() => {
            offcanvas()
        })

        it('should add and handle "offcanvas-close-button"', () => {
            const closeButton = mockCanvas.querySelector('.offcanvas-close-button')
            expect(closeButton).toBeTruthy()

            const closeSpy = vi.spyOn(mockCanvas, 'dispatchEvent')

            // Simulate close button click
            closeButton?.dispatchEvent(new Event('click'))

            expect(closeSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'offcanvas:close',
                }),
            )
        })
    })

    describe('edge cases', () => {
        it('should not throw if no canvas found', () => {
            document.body.innerHTML = ''
            expect(() => {
                offcanvas({selector: '.not-exist'})
            }).not.toThrow()
        })

        it('should handle invalid duration gracefully', () => {
            mockCanvas.dataset.duration = 'invalid'
            offcanvas()

            expect(mockCanvas.style.transition).toContain('0.5s') // Should default to 0s
        })
    })
})
