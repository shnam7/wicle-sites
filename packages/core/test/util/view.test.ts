import {describe, it, expect, afterEach, vi} from 'vitest'
import {getViewportSize} from '../../scripts/util/view.js'

describe('getViewporSize', () => {
    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('should return viewport size using innerWidth/innerHeight when available', () => {
        // innerWidth/innerHeight가 사용 가능한 경우
        vi.stubGlobal('innerWidth', 1920)
        vi.stubGlobal('innerHeight', 1080)

        const result = getViewportSize()

        expect(result).toEqual({
            width: 1920,
            height: 1080,
        })
    })

    it('should fallback to documentElement clientWidth/clientHeight when innerWidth is not available', () => {
        // innerWidth가 없는 경우
        Reflect.deleteProperty(globalThis, 'innerWidth')
        Reflect.deleteProperty(globalThis, 'innerHeight')

        // document.documentElement 모킹
        const mockDocumentElement = {
            clientWidth: 1366,
            clientHeight: 768,
        }

        vi.stubGlobal('document', {
            documentElement: mockDocumentElement,
            body: null,
        })

        const result = getViewportSize()

        expect(result).toEqual({
            width: 1366,
            height: 768,
        })
    })

    it('should fallback to document.body when documentElement is not available', () => {
        // innerWidth가 없고 documentElement도 없는 경우
        Reflect.deleteProperty(globalThis, 'innerWidth')
        Reflect.deleteProperty(globalThis, 'innerHeight')

        const mockBody = {
            clientWidth: 800,
            clientHeight: 600,
        }

        vi.stubGlobal('document', {
            documentElement: null,
            body: mockBody,
        })

        const result = getViewportSize()

        expect(result).toEqual({
            width: 800,
            height: 600,
        })
    })

    it('should handle edge case with zero dimensions', () => {
        vi.stubGlobal('innerWidth', 0)
        vi.stubGlobal('innerHeight', 0)

        const result = getViewportSize()

        expect(result).toEqual({
            width: 0,
            height: 0,
        })
    })
})
