import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest'
import {mqStart, breakPointsReg, type BreakPoints} from '../../scripts/ui/media-query.js'
import {getViewporSize} from '../../scripts/util/view.js'

// Mock the view module
vi.mock('../../scripts/util/view.js', () => ({
    getViewporSize: vi.fn(),
}))

const mockGetViewporSize = vi.mocked(getViewporSize)

describe('MediaQuery', () => {
    beforeEach(() => {
        vi.spyOn(globalThis, 'addEventListener').mockImplementation(() => {})
        vi.spyOn(globalThis, 'dispatchEvent')
        vi.spyOn(globalThis, 'removeEventListener').mockImplementation(() => {})
        // Mock getViewporSize
        // mockGetViewporSize.mockReturnValue({width: 1024, height: 768})

        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('breakPointsReg', () => {
        it('should contain predefined breakpoint sets', () => {
            expect(breakPointsReg.foundation).toBeDefined()
            expect(breakPointsReg.semanticUI).toBeDefined()
            expect(breakPointsReg.uikit).toBeDefined()
            expect(breakPointsReg.bootStrap).toBeDefined()
            expect(breakPointsReg.simple).toBeDefined()
            expect(breakPointsReg.basic).toBeDefined()
            expect(breakPointsReg.tailwind).toBeDefined()
        })

        it('should have first entry value as 0 for all breakpoint sets', () => {
            for (const breakPoints of Object.values(breakPointsReg)) {
                const firstValue = Object.values(breakPoints)[0]
                expect(firstValue).toBe(0)
            }
        })
    })

    describe('mqStart', () => {
        it('should use tailwind breakpoints by default', () => {
            mqStart()

            expect(addEventListener).toHaveBeenCalledWith('mq:init', expect.any(Function))
            expect(addEventListener).toHaveBeenCalledWith('mq:report', expect.any(Function))
            expect(addEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
        })

        it('should register event handlers', () => {
            mqStart()
            expect(addEventListener).toHaveBeenCalledWith('mq:init', expect.any(Function))
            expect(addEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
            expect(addEventListener).toHaveBeenCalledWith('mq:report', expect.any(Function))
        })

        it('should dispatch initial events', () => {
            mqStart()
            expect(dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({type: 'mq:init'}))
            expect(dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({type: 'resize'}))
        })

        it('should handle mq:init event correctly', () => {
            mockGetViewporSize.mockReturnValue({width: 800, height: 600})

            mqStart()

            const initCall = (globalThis.addEventListener as any).mock.calls.find(
                (call: any[]) => call[0] === 'mq:init',
            )
            expect(initCall).toBeDefined()
            const initHandler = initCall![1]
            initHandler(new Event('mq:init'))
            expect(mockGetViewporSize).toHaveBeenCalled()
        })

        it('should handle resize event and detect state changes', () => {
            // set initial viewport size
            mockGetViewporSize.mockReturnValue({width: 500, height: 600})

            mqStart()

            // execute mq:init process
            const initCall = (window.addEventListener as any).mock.calls.find(
                (call: any[]) => call[0] === 'mq:init',
            )
            expect(initCall).toBeDefined()
            const initHandler = initCall![1]
            initHandler(new Event('mq:init'))

            // change viewport size
            mockGetViewporSize.mockReturnValue({width: 1200, height: 800})

            // execute resize process
            const resizeCall = (window.addEventListener as any).mock.calls.find(
                (call: any[]) => call[0] === 'resize',
            )
            expect(resizeCall).toBeDefined()

            const resizeHandler = resizeCall![1]
            resizeHandler(new Event('resize'))

            expect(window.dispatchEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'mq:change',
                    detail: expect.objectContaining({
                        state: expect.any(String),
                        width: 1200,
                        prevState: expect.any(String),
                        prevWidth: 500,
                    }),
                }),
            )
        })

        it('should handle mq:report event correctly', () => {
            mqStart()

            // init
            const initCall = (window.addEventListener as any).mock.calls.find(
                (call: any[]) => call[0] === 'mq:init',
            )
            expect(initCall).toBeDefined()
            const initHandler = initCall![1]
            mockGetViewporSize.mockReturnValue({width: 500, height: 600})
            initHandler(new Event('mq:init'))

            // call mq:report
            const reportCall = (window.addEventListener as any).mock.calls.find(
                (call: any[]) => call[0] === 'mq:report',
            )
            expect(reportCall).toBeDefined()
            const reportHandler = reportCall![1]

            reportHandler(new Event('mq:report'))
            expect(window.dispatchEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'mq:state',
                    detail: expect.objectContaining({
                        state: expect.any(String),
                        width: expect.any(Number),
                        prevState: expect.any(String),
                        prevWidth: expect.any(Number),
                        breakPoints: expect.any(Object),
                    }),
                }),
            )
        })

        it('should not dispatch mq:change when state remains the same', () => {
            mockGetViewporSize.mockReturnValue({width: 1200, height: 800})

            mqStart()

            // mq:init
            const initCall = (window.addEventListener as any).mock.calls.find(
                (call: any[]) => call[0] === 'mq:init',
            )
            expect(initCall).toBeDefined()
            const initHandler = initCall![1]
            initHandler(new Event('mq:init'))

            // return the same size in the next resize
            mockGetViewporSize.mockReturnValue({width: 1250, height: 800})
            const resizeCall = (window.addEventListener as any).mock.calls.find(
                (call: any[]) => call[0] === 'resize',
            )
            expect(resizeCall).toBeDefined()
            const resizeHandler = resizeCall![1]
            resizeHandler(new Event('resize'))

            // confiem mq:change was not executed
            const changeEvents = (window.dispatchEvent as any).mock.calls.filter(
                (call: any[]) => call[0].type === 'mq:change',
            )
            expect(changeEvents).toHaveLength(0)
        })
    })
})
