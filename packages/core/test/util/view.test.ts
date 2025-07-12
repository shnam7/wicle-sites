import {describe, it, expect, beforeEach, afterEach} from 'vitest'
import {getViewporSize} from '../../scripts/util/view.js'

describe('getViewporSize', () => {
    let originalInnerWidth: number | undefined
    let originalInnerHeight: number | undefined
    let originalDocument: Document

    beforeEach(() => {
        // 원본 값들을 백업
        originalInnerWidth = globalThis.innerWidth
        originalInnerHeight = globalThis.innerHeight
        originalDocument = globalThis.document
    })

    afterEach(() => {
        // 원본 값들을 복원
        if (originalInnerWidth === undefined) {
            delete (globalThis as any).innerWidth
        } else {
            ;(globalThis as any).innerWidth = originalInnerWidth
        }

        if (originalInnerHeight === undefined) {
            delete (globalThis as any).innerHeight
        } else {
            ;(globalThis as any).innerHeight = originalInnerHeight
        }

        ;(globalThis as any).document = originalDocument
    })

    it('should return viewport size using innerWidth/innerHeight when available', () => {
        // innerWidth/innerHeight가 사용 가능한 경우
        ;(globalThis as any).innerWidth = 1920
        ;(globalThis as any).innerHeight = 1080

        const result = getViewporSize()

        expect(result).toEqual({
            width: 1920,
            height: 1080,
        })
    })

    it('should fallback to documentElement clientWidth/clientHeight when innerWidth is not available', () => {
        // innerWidth가 없는 경우
        delete (globalThis as any).innerWidth
        delete (globalThis as any).innerHeight

        // document.documentElement 모킹
        const mockDocumentElement = {
            clientWidth: 1366,
            clientHeight: 768,
        }

        ;(globalThis as any).document = {
            documentElement: mockDocumentElement,
            body: null,
        }

        const result = getViewporSize()

        expect(result).toEqual({
            width: 1366,
            height: 768,
        })
    })

    it('should fallback to document.body when documentElement is not available', () => {
        // innerWidth가 없고 documentElement도 없는 경우
        delete (globalThis as any).innerWidth
        delete (globalThis as any).innerHeight

        const mockBody = {
            clientWidth: 800,
            clientHeight: 600,
        }

        ;(globalThis as any).document = {
            documentElement: null,
            body: mockBody,
        }

        const result = getViewporSize()

        expect(result).toEqual({
            width: 800,
            height: 600,
        })
    })

    it('should handle edge case with zero dimensions', () => {
        ;(globalThis as any).innerWidth = 0
        ;(globalThis as any).innerHeight = 0

        const result = getViewporSize()

        expect(result).toEqual({
            width: 0,
            height: 0,
        })
    })
})
