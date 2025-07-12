import {describe, it, expect, beforeEach} from 'vitest'
import {siblings} from '../../scripts/util/siblings.js'

describe('siblings', () => {
    let container: HTMLElement
    let elem1: HTMLElement
    let elem2: HTMLElement
    let elem3: HTMLElement

    beforeEach(() => {
        // Create a mock DOM structure
        container = document.createElement('div')
        elem1 = document.createElement('span')
        elem2 = document.createElement('p')
        elem3 = document.createElement('a')

        container.append(elem1)
        container.append(elem2)
        container.append(elem3)
    })

    it('should return all sibling elements excluding the element itself', () => {
        const result = siblings(elem2)

        expect(result).toHaveLength(2)
        expect(result).toContain(elem1)
        expect(result).toContain(elem3)
        expect(result).not.toContain(elem2)
    })

    it('should return empty array when element has no siblings', () => {
        const singleChild = document.createElement('div')
        const parent = document.createElement('section')
        parent.append(singleChild)

        const result = siblings(singleChild)

        expect(result).toEqual([])
    })

    it('should return empty array when element is undefined', () => {
        const result = siblings(undefined)

        expect(result).toEqual([])
    })

    it('should return empty array when element does not have parent', () => {
        const element = document.createElement('div')
        const result = siblings(element)

        expect(result).toEqual([])
    })

    it('should only return element siblings, not text nodes', () => {
        const parent = document.createElement('div')
        const element = document.createElement('span')
        const siblingElement = document.createElement('p')

        parent.append(document.createTextNode('text node'))
        parent.append(element)
        parent.append(document.createTextNode('another text'))
        parent.append(siblingElement)

        const result = siblings(element)

        expect(result).toHaveLength(1)
        expect(result).toContain(siblingElement)
    })

    it('should return empty array when element has no parent', () => {
        const orphanElement = document.createElement('div')

        const result = siblings(orphanElement)

        expect(result).toEqual([])
    })

    it('should return empty array when parent has no children', () => {
        const parent = document.createElement('div')
        const element = document.createElement('span')
        parent.append(element)
        element.remove()

        const result = siblings(element)

        expect(result).toEqual([])
    })

    it('should handle elements with comment nodes as siblings', () => {
        const parent = document.createElement('div')
        const element = document.createElement('span')
        const siblingElement = document.createElement('p')

        parent.append(element)
        parent.append(document.createComment('comment'))
        parent.append(siblingElement)

        const result = siblings(element)

        expect(result).toHaveLength(1)
        expect(result).toContain(siblingElement)
    })
})
