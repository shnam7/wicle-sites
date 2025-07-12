// @vitest-environment jsdom

import {describe, it, expect, beforeEach, vi, afterEach} from 'vitest'
import {slideDown, slideUp} from '../../scripts/util/slider.js'

describe('slider', () => {
    let element: HTMLElement

    beforeEach(() => {
        // Mock timers to control setTimeout
        vi.useFakeTimers()

        // Create a test element
        element = document.createElement('div')
        element.innerHTML = '<p>Test content</p>'
        document.body.append(element)

        // Reset styles
        element.style.cssText = ''
        element.style.display = 'block'
        element.style.height = 'auto'

        // Mock scrollHeight and offsetHeight
        Object.defineProperty(element, 'scrollHeight', {
            configurable: true,
            value: 100,
        })
        Object.defineProperty(element, 'offsetHeight', {
            configurable: true,
            value: 100,
        })
    })

    afterEach(() => {
        vi.useRealTimers()
        element.remove()
    })

    describe('slideDown', () => {
        it('should handle undefined element gracefully', () => {
            expect(() => {
                slideDown(undefined)
            }).not.toThrow()
            expect(() => {
                slideDown()
            }).not.toThrow()
        })

        it('should set initial styles for slide down animation', () => {
            slideDown(element)

            expect(element.style.overflow).toBe('hidden')
            expect(element.style.height).toBe('100px')
            expect(element.style.display).toBe('block')
            expect(element.style.transition).toBe('height 300ms ease')
        })

        it('should use custom duration', () => {
            slideDown(element, 500)

            expect(element.style.transition).toBe('height 500ms ease')
        })

        it('should clear styles after animation completes', () => {
            slideDown(element, 300)

            // Fast-forward time to after animation
            vi.advanceTimersByTime(300)

            expect(element.style.height).toBe('')
            expect(element.style.overflow).toBe('')
            expect(element.style.transition).toBe('')
        })

        it('should start with height 0 initially', () => {
            // Check the initial state before height is set to scrollHeight
            element.style.height = '0'
            slideDown(element)

            // The function should set height to scrollHeight after initial setup
            expect(element.style.height).toBe('100px')
        })
    })

    describe('slideUp', () => {
        it('should handle undefined element gracefully', () => {
            expect(() => {
                slideUp(undefined)
            }).not.toThrow()
            expect(() => {
                slideUp()
            }).not.toThrow()
        })

        it('should set initial styles for slide up animation', () => {
            slideUp(element)

            expect(element.style.overflow).toBe('hidden')
            expect(element.style.height).toBe('100px')
            expect(element.style.transition).toBe('height 300ms ease')
        })

        it('should use custom duration', () => {
            slideUp(element, 500)

            expect(element.style.transition).toBe('height 500ms ease')
        })

        it('should start height collapse after 10ms', () => {
            slideUp(element)

            // Before 10ms
            expect(element.style.height).toBe('100px')

            // After 10ms
            vi.advanceTimersByTime(10)
            expect(element.style.height).toBe('0px')
        })

        it('should hide element and clear styles after animation completes', () => {
            slideUp(element, 300)

            // Fast-forward to animation completion
            vi.advanceTimersByTime(300)

            expect(element.style.display).toBe('none')
            expect(element.style.height).toBe('')
            expect(element.style.overflow).toBe('')
            expect(element.style.transition).toBe('')
        })

        it('should use default duration when not specified', () => {
            slideUp(element)

            expect(element.style.transition).toBe('height 300ms ease')

            // Should complete after default 300ms
            vi.advanceTimersByTime(300)
            expect(element.style.display).toBe('none')
        })
    })

    describe('animation sequence', () => {
        it('should properly handle slideDown followed by slideUp', () => {
            // Start with slideDown
            slideDown(element, 200)
            expect(element.style.display).toBe('block')
            expect(element.style.height).toBe('100px')

            // Complete slideDown animation
            vi.advanceTimersByTime(200)
            expect(element.style.height).toBe('')

            // Start slideUp
            slideUp(element, 200)
            expect(element.style.height).toBe('100px')

            // After 10ms delay
            vi.advanceTimersByTime(10)
            expect(element.style.height).toBe('0px')

            // Complete slideUp animation
            vi.advanceTimersByTime(200)
            expect(element.style.display).toBe('none')
        })
    })

    describe('edge cases', () => {
        it('should handle element with zero scrollHeight', () => {
            Object.defineProperty(element, 'scrollHeight', {
                configurable: true,
                value: 0,
            })

            slideDown(element)
            expect(element.style.height).toBe('0px')
        })

        it('should handle element with zero offsetHeight', () => {
            Object.defineProperty(element, 'offsetHeight', {
                configurable: true,
                value: 0,
            })

            slideUp(element)
            expect(element.style.height).toBe('0px')
        })

        it('should handle very short duration', () => {
            slideDown(element, 1)
            expect(element.style.transition).toBe('height 1ms ease')

            vi.advanceTimersByTime(1)
            expect(element.style.height).toBe('')
        })

        it('should handle zero duration', () => {
            slideUp(element, 0)
            expect(element.style.transition).toBe('height 0ms ease')

            vi.advanceTimersByTime(10) // After the 10ms delay for height collapse
            expect(element.style.height).toBe('0px')

            vi.advanceTimersByTime(0) // Complete immediately
            expect(element.style.display).toBe('none')
        })
    })
})
