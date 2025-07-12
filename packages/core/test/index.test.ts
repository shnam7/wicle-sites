import {describe, it, expect, vi} from 'vitest'
import * as index from '../scripts/index.ts'

// Mock all modules exported in index.ts
vi.mock('../scripts/ui/offcanvas.ts', () => ({
    offcanvasFunction: vi.fn(),
    OffcanvasClass: vi.fn(),
}))
vi.mock('../scripts/ui/nav.ts', () => ({
    navFunction: vi.fn(),
    NavClass: vi.fn(),
}))
vi.mock('../scripts/ui/parallax.ts', () => ({
    parallaxFunction: vi.fn(),
    ParallaxClass: vi.fn(),
}))
vi.mock('../scripts/ui/media-query.ts', () => ({
    mediaQueryFunction: vi.fn(),
    MediaQueryClass: vi.fn(),
}))
vi.mock('../scripts/util/siblings.ts', () => ({
    siblingsFunction: vi.fn(),
    getSiblings: vi.fn(),
}))
vi.mock('../scripts/util/view.ts', () => ({
    viewFunction: vi.fn(),
    ViewClass: vi.fn(),
}))
vi.mock('../scripts/util/slider.ts', () => ({
    sliderFunction: vi.fn(),
    SliderClass: vi.fn(),
}))

describe('index.ts exports', () => {
    it('should export offcanvas module functions', () => {
        expect(index).toHaveProperty('offcanvasFunction')
        expect(index).toHaveProperty('OffcanvasClass')
    })

    it('should export nav module functions', () => {
        expect(index).toHaveProperty('navFunction')
        expect(index).toHaveProperty('NavClass')
    })

    it('should export parallax module functions', () => {
        expect(index).toHaveProperty('parallaxFunction')
        expect(index).toHaveProperty('ParallaxClass')
    })

    it('should export media-query module functions', () => {
        expect(index).toHaveProperty('mediaQueryFunction')
        expect(index).toHaveProperty('MediaQueryClass')
    })

    it('should export siblings module functions', () => {
        expect(index).toHaveProperty('siblingsFunction')
        expect(index).toHaveProperty('getSiblings')
    })

    it('should export view module functions', () => {
        expect(index).toHaveProperty('viewFunction')
        expect(index).toHaveProperty('ViewClass')
    })

    it('should export slider module functions', () => {
        expect(index).toHaveProperty('sliderFunction')
        expect(index).toHaveProperty('SliderClass')
    })

    it('should have all expected exports', () => {
        const expectedExports = [
            'offcanvasFunction',
            'OffcanvasClass',
            'navFunction',
            'NavClass',
            'parallaxFunction',
            'ParallaxClass',
            'mediaQueryFunction',
            'MediaQueryClass',
            'siblingsFunction',
            'getSiblings',
            'viewFunction',
            'ViewClass',
            'sliderFunction',
            'SliderClass',
        ]

        for (const exportName of expectedExports) {
            expect(index).toHaveProperty(exportName)
        }
    })

    it('should not have unexpected exports', () => {
        const exportKeys = Object.keys(index)
        const expectedExports = [
            'offcanvasFunction',
            'OffcanvasClass',
            'navFunction',
            'NavClass',
            'parallaxFunction',
            'ParallaxClass',
            'mediaQueryFunction',
            'MediaQueryClass',
            'siblingsFunction',
            'getSiblings',
            'viewFunction',
            'ViewClass',
            'sliderFunction',
            'SliderClass',
        ]

        for (const key of exportKeys) {
            expect(expectedExports).toContain(key)
        }
    })
})
