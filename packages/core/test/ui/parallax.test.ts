import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest'
import {Container, Surface, Parallax} from '../../scripts/ui/parallax.js'

describe('Parallax module', () => {
    let mockElement: HTMLElement
    let mockWindow: Window & typeof globalThis

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = ''

        // Mock HTML element
        mockElement = document.createElement('div')
        mockElement.style.position = 'relative'
        mockElement.style.height = '1000px'
        mockElement.style.overflow = 'scroll'
        mockElement.scrollTop = 0
        vi.spyOn(mockElement, 'addEventListener')
        document.body.append(mockElement)

        // Mock window object
        mockWindow = globalThis as Window & typeof globalThis
        mockWindow.scrollY = 0
        vi.spyOn(mockWindow, 'addEventListener')
    })

    afterEach(() => {
        document.body.innerHTML = ''
        vi.restoreAllMocks()
    })

    describe('Container', () => {
        it('should create a container with correct initial properties', () => {
            const perspective = 0.5
            const container = new Container(mockElement, perspective)

            expect(container).toBeDefined()
            expect(mockElement.addEventListener).toHaveBeenCalledWith(
                'scroll',
                expect.any(Function),
            )
        })

        it('should create a container with Window object', () => {
            const perspective = 0.5
            const container = new Container(mockWindow, perspective)

            expect(container).toBeDefined()
            expect(mockWindow.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
        })

        it('should add first surface with perspective 1', () => {
            const container = new Container(mockElement, 0.5)
            const surfaceElement = document.createElement('div')
            const surface = new Surface(surfaceElement, 0)

            container.addSurface(surface)

            expect(surface.perspective).toBe(1)
        })

        it('should add subsequent surfaces with calculated perspective', () => {
            const container = new Container(mockElement, 0.5)
            const surfaceElement1 = document.createElement('div')
            const surfaceElement2 = document.createElement('div')

            const surface1 = new Surface(surfaceElement1, 0)
            const surface2 = new Surface(surfaceElement2, 0)

            container.addSurface(surface1)
            container.addSurface(surface2)

            expect(surface1.perspective).toBe(1)
            expect(surface2.perspective).toBe(0.5) // 0.5 * 1
        })

        it('should add surfaces with custom perspectives', () => {
            const container = new Container(mockElement, 0.5)
            const surfaceElement1 = document.createElement('div')
            const surfaceElement2 = document.createElement('div')

            const surface1 = new Surface(surfaceElement1, 2)
            const surface2 = new Surface(surfaceElement2, 3)

            container.addSurface(surface1)
            container.addSurface(surface2)

            expect(surface1.perspective).toBe(2)
            expect(surface2.perspective).toBe(6) // 3 * 2
        })

        it('should handle scroll events on HTMLElement', () => {
            const container = new Container(mockElement, 0.5)
            const surfaceElement = document.createElement('div')
            const surface = new Surface(surfaceElement)

            // Spy on surface.scroll method
            const scrollSpy = vi.spyOn(surface, 'scroll')

            container.addSurface(surface)

            // Mock scrollTop value
            mockElement.scrollTop = 100

            // Trigger scroll event
            const scrollEvent = new Event('scroll')
            mockElement.dispatchEvent(scrollEvent)

            expect(scrollSpy).toHaveBeenCalledWith(-100)
        })

        it('should handle scroll events on Window', () => {
            mockWindow.scrollY = 150
            const container = new Container(mockWindow, 0.5)
            const surfaceElement = document.createElement('div')
            const surface = new Surface(surfaceElement)

            // Spy on surface.scroll method
            const scrollSpy = vi.spyOn(surface, 'scroll')
            container.addSurface(surface)

            // Get the scroll event handler that was registered and trigger it
            expect(mockWindow.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
            mockWindow.dispatchEvent(new Event('scroll'))

            // check sufface scroll method was called with the correct value
            expect(scrollSpy).toHaveBeenCalledWith(-150)
        })
    })

    describe('Surface', () => {
        it('should create a surface with default parameters', () => {
            const element = document.createElement('div')
            const surface = new Surface(element)

            expect(surface.perspective).toBe(0)
            expect(element.style.position).toBe('fixed')
            expect(element.style.transform).toBe('none')
        })

        it('should create a surface with custom parameters', () => {
            const element = document.createElement('div')
            const surface = new Surface(element, 0.8, 'absolute')

            expect(surface.perspective).toBe(0.8)
            expect(element.style.position).toBe('absolute')
            expect(element.style.transform).toBe('none')
        })

        it('should apply transform when scroll is called', () => {
            const element = document.createElement('div')
            const surface = new Surface(element, 0.5)

            surface.scroll(-100)

            expect(element.style.transform).toBe('translate3d(0, -50px, 0)')
        })

        it('should apply transform with different perspective values', () => {
            const element = document.createElement('div')
            const surface = new Surface(element, 0.25)

            surface.scroll(-200)

            expect(element.style.transform).toBe('translate3d(0, -50px, 0)')
        })

        it('should handle positive scroll values', () => {
            const element = document.createElement('div')
            const surface = new Surface(element, 0.5)

            surface.scroll(100)

            expect(element.style.transform).toBe('translate3d(0, 50px, 0)')
        })

        it('should handle zero scroll values', () => {
            const element = document.createElement('div')
            const surface = new Surface(element, 0.5)

            surface.scroll(0)

            expect(element.style.transform).toBe('translate3d(0, 0px, 0)')
        })
    })

    describe('Parallax export', () => {
        it('should export Container and Surface classes', () => {
            expect(Parallax.Container).toBe(Container)
            expect(Parallax.Surface).toBe(Surface)
        })

        it('should work as default export', () => {
            const container = new Parallax.Container(mockElement, 0.5)
            const surface = new Parallax.Surface(document.createElement('div'))

            expect(container).toBeDefined()
            expect(surface).toBeDefined()
        })
    })

    describe('Integration tests', () => {
        it('should create a complete parallax setup', () => {
            const container = new Container(mockElement, 0.5)

            // Create multiple surfaces
            const surface1Element = document.createElement('div')
            const surface2Element = document.createElement('div')
            const surface3Element = document.createElement('div')

            const surface1 = new Surface(surface1Element, 0) // Will become 1
            const surface2 = new Surface(surface2Element, 0) // Will become 0.5
            const surface3 = new Surface(surface3Element, 0) // Will become 0.25

            // Spy on scroll methods
            const scroll1Spy = vi.spyOn(surface1, 'scroll')
            const scroll2Spy = vi.spyOn(surface2, 'scroll')
            const scroll3Spy = vi.spyOn(surface3, 'scroll')

            container.addSurface(surface1)
            container.addSurface(surface2)
            container.addSurface(surface3)

            // Verify perspectives
            expect(surface1.perspective).toBe(1)
            expect(surface2.perspective).toBe(0.5)
            expect(surface3.perspective).toBe(0.25)
            mockElement.scrollTop = 100

            // Trigger scroll
            mockElement.dispatchEvent(new Event('scroll'))

            // Verify all surfaces were scrolled
            expect(scroll1Spy).toHaveBeenCalledWith(-100)
            expect(scroll2Spy).toHaveBeenCalledWith(-100)
            expect(scroll3Spy).toHaveBeenCalledWith(-100)

            // Verify transform values
            expect(surface1Element.style.transform).toBe('translate3d(0, -100px, 0)')
            expect(surface2Element.style.transform).toBe('translate3d(0, -50px, 0)')
            expect(surface3Element.style.transform).toBe('translate3d(0, -25px, 0)')
        })
    })
})
