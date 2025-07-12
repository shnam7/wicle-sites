import {beforeEach, afterEach, describe, expect, it, vi} from 'vitest'
import {nav} from '../../scripts/ui/nav.ts'
import {slideDown, slideUp} from '../../scripts/util/slider.ts'

vi.mock('../../scripts/util/slider.ts', async () => {
    return {
        slideDown: vi.fn(),
        slideUp: vi.fn(),
    }
})

const navHTML = `
    <ul class="w-nav">
        <li><a href='#'>Home</a></li>
        <li>
            <a href='#'>Java</a>
            <ul>
                <li><a href='#'>Test fro Java</a></li>
            </ul>
        </li>
        <li>
            <a href='#'>rust</a>
            <ul>
                <li><a href='#'>Test for Rust</a></li>
            </ul>
        </li>
    </ul>
`

describe('nav', () => {
    let container: HTMLElement
    let navElement: HTMLElement

    beforeEach(() => {
        document.body.innerHTML = ''
        container = document.createElement('div')
        document.body.append(container)
        container.innerHTML = navHTML
        navElement = container.querySelector('.w-nav')!
    })

    afterEach(() => {
        document.body.innerHTML = ''
        vi.restoreAllMocks()
    })

    describe('initialization', () => {
        it('should initialize basic navigation', () => {
            nav()

            const items = navElement.querySelectorAll('.w-nav-item')
            expect(items.length).toBe(5)

            const wrappers = document.querySelectorAll('.w-nav-item-wrapper')
            expect(wrappers.length).toBe(5)
        })

        it('should initialize navigation with custom selector', () => {
            container.innerHTML = `
                <nav class="custom-nav" data-parent-link="true" data-single-open="true">
                    <ul>
                        <li><a href="#">Menu 1</a></li>
                    </ul>
                </nav>
            `

            nav({selector: '.custom-nav'})

            const customNav = document.querySelector('.custom-nav')
            expect(customNav).not.toBeNull()
            expect(customNav?.classList.contains('custom-nav')).toBe(true)
        })

        it('should apply options through nav() function', () => {
            navElement.classList.add('wo-accordion')

            nav({speed: 300})

            const navItem = navElement.querySelector<HTMLElement>('.w-nav-parent')!
            const navItemClickArea = navItem.querySelector<HTMLElement>('.w-nav-item-wrapper')!
            expect(navItem).not.toBeNull()
            expect(navItemClickArea).not.toBeNull()

            const sub = navItem.querySelector<HTMLElement>('.w-nav-child')!
            sub.style.display = 'none'
            navItemClickArea.click()

            expect(slideDown).toHaveBeenCalledWith(expect.any(HTMLElement), 300)
        })

        it('should apply options through dataset', () => {
            navElement.classList.add('wo-accordion')
            navElement.dataset.speed = '350'

            nav()

            const navItem = navElement.querySelector<HTMLElement>('.w-nav-parent')!
            const navItemClickArea = navItem.querySelector<HTMLElement>('.w-nav-item-wrapper')!
            expect(navItem).not.toBeNull()
            expect(navItemClickArea).not.toBeNull()

            const sub = navItem.querySelector<HTMLElement>('.w-nav-child')!
            sub.style.display = 'none'
            navItemClickArea.click()

            expect(slideDown).toHaveBeenCalledWith(expect.any(HTMLElement), 350)
        })

        it('should handle invalid speed option', () => {
            navElement.classList.add('wo-accordion')
            navElement.dataset.speed = 'invalid'

            nav()

            const navItem = navElement.querySelector<HTMLElement>('.w-nav-parent')!
            const navItemClickArea = navItem.querySelector<HTMLElement>('.w-nav-item-wrapper')!
            expect(navItem).not.toBeNull()
            expect(navItemClickArea).not.toBeNull()

            const sub = navItem.querySelector<HTMLElement>('.w-nav-child')!
            sub.style.display = 'none'
            navItemClickArea.click()

            expect(slideDown).toHaveBeenCalledWith(expect.any(HTMLElement), 200) // default speed
        })

        it('should set classes for dropdown navigation elements', () => {
            navElement.classList.add('wo-dropdown')

            nav()

            const parentItem = document.querySelector('li.w-nav-parent')
            expect(parentItem).not.toBeNull()

            const childMenu = document.querySelector('ul.w-nav-child')
            expect(childMenu).not.toBeNull()

            const parentMarker = document.querySelector('.w-nav-parent-marker')
            expect(parentMarker).not.toBeNull()
        })

        it('should add w-nav-divider class to items with divider', () => {
            container.innerHTML = `
                <nav class="w-nav">
                    <ul>
                    <li><a href="#">Normal Menu</a></li>
                    <li>- Divider Menu </li>
                    </ul>
                </nav>
            `
            nav()

            const dividerItem = document.querySelectorAll('.w-nav-divider')
            expect(dividerItem.length).toBe(1)
        })

        it('should handle parent link', async () => {
            container.innerHTML = `
                <ul class="w-nav wo-accordion" data-parent-link="true">
                    <li>
                        <a href="aaabbb">Parent Link</a>
                        <ul>
                            <li><a href="#">Child Link1</a></li>
                            <li><a href="#">Child Link2</a></li>
                        </ul>
                    </li>
                </ul>
            `
            nav()

            const parentLink = document.querySelector('.w-nav-parent')!
            expect(parentLink).not.toBeNull()
            expect(parentLink?.classList.contains('w-nav-parent')).toBe(true)

            const clickArea = parentLink.querySelector<HTMLElement>('.w-nav-item-wrapper')!
            expect(clickArea).not.toBeNull()
            clickArea.click()

            await vi.waitFor(() => {
                expect(document.location.href.endsWith('aaabbb')).toBeTruthy()
            })
        })
    })

    describe('accordion menu', () => {
        beforeEach(() => {
            navElement.classList.add('wo-accordion')
        })
        it('should handle accordion menu click events', () => {
            vi.mock('../../scripts/util/slider.ts', () => ({
                slideDown: vi.fn(),
                slideUp: vi.fn(),
            }))

            nav()

            const clickArea = document.querySelector('.w-nav-accordion-click-area')
            expect(clickArea).not.toBeNull()

            const event = new Event('click')
            Object.defineProperty(event, 'target', {value: clickArea})
            Object.defineProperty(event, 'preventDefault', {value: vi.fn()})
            document.querySelector('.w-nav-accordion-click-area')?.dispatchEvent(event)
        })

        it('should close other submenus when one is opened if singleOpen option is true', async () => {
            nav({singleOpen: true})

            const parents = navElement.querySelectorAll<HTMLElement>('.w-nav-parent')
            expect(parents.length).toBe(2)

            const clickArea1 = parents[0].querySelector<HTMLElement>('.w-nav-item-wrapper')!
            const clickArea2 = parents[0].querySelector<HTMLElement>('.w-nav-item-wrapper')!
            const subMenu1 = parents[0].querySelector<HTMLElement>('.w-nav-child')!
            const subMenu2 = parents[1].querySelector<HTMLElement>('.w-nav-child')!
            expect(subMenu1).not.toBeNull()
            expect(subMenu2).not.toBeNull()
            subMenu1.style.display = 'block' // open first submenu
            subMenu2.style.display = 'none' // ensure second submenu is closed

            clickArea2.click() // click on second parent to open it

            // await vi.waitFor(() => {
            //     expect(slideDown).toHaveBeenCalledWith(subMenu2, 300)
            //     expect(slideUp).toHaveBeenCalledWith(subMenu1, 300)
            // })

            // const anotherParentItem = navElement.querySelectorAll<HTMLElement>('.w-nav-parent')[1]
            // const anotherSubMenu = anotherParentItem.querySelector<HTMLElement>('.w-nav-child')!
            // anotherSubMenu.style.display = 'none'

            // const clickArea = parentItem.querySelector<HTMLElement>('.w-nav-item-wrapper')!
            // clickArea.click()

            // expect(slideDown).toHaveBeenCalledWith(subMenu, 300)
            // expect(slideUp).toHaveBeenCalledWith(anotherSubMenu, 300)
        })
    })

    describe('dropdown menu', () => {
        beforeEach(() => {
            navElement.classList.add('wo-dropdown')
        })
        it('should handle dropdown mouse enter event and add js-flip class', async () => {
            nav()

            Object.defineProperty(document.body, 'clientWidth', {
                value: 1024, // 원하는 값 설정
                writable: true, // 값을 변경 가능하도록 설정
            })
            Object.defineProperty(globalThis, 'innerHeight', {
                value: 768, // 원하는 값 설정
                writable: true, // 값을 변경 가능하도록 설정
            })

            const parentElement = navElement.querySelector('.w-nav-parent')!
            const childElement = navElement.querySelector('.w-nav-child')!
            expect(parentElement).not.toBeNull()
            expect(childElement).not.toBeNull()

            vi.spyOn(childElement, 'getBoundingClientRect').mockImplementation(() => ({
                width: 100,
                height: 100,
                top: 60,
                left: 900,
                right: 1024,
                bottom: 768,
                x: 50,
                y: 60,
                toJSON: () => ({}),
            }))
            parentElement.dispatchEvent(new Event('mouseenter'))

            await vi.waitFor(() => {
                expect(childElement.getAttribute('js-flip')).toBe('xy')
            })
        })

        it('should handle window resize event', () => {
            nav()
            const childElement = navElement.querySelector('.w-nav-child')!
            expect(childElement).not.toBeNull()
            childElement.setAttribute('js-flip', 'xy')

            let flippedElements = document.querySelectorAll('.w-nav [js-flip]')
            expect(flippedElements.length).toBe(1)

            const resizeEvent = new Event('resize')
            globalThis.dispatchEvent(resizeEvent)

            flippedElements = document.querySelectorAll('.w-nav [js-flip]')
            expect(flippedElements.length).toBe(0)
        })
    })

    describe('cleaning navigation', () => {
        it('should remove dynamic elements and classes with nav:clean event', () => {
            nav()

            navElement.dispatchEvent(new Event('nav:clean'))

            const parentMarker = document.querySelector('.w-nav-parent-marker')
            expect(parentMarker).toBeNull()
        })

        it('should remove accordion event handllers', () => {
            navElement.classList.add('wo-accordion')
            nav()

            const clickArea = navElement.querySelector<HTMLElement>(
                '.w-nav-parent,.w-nav-accordion-click-area',
            )!
            expect(clickArea).not.toBeNull()
            const removeEventHandlerSpy = vi.spyOn(clickArea, 'removeEventListener')

            navElement.dispatchEvent(new Event('nav:clean'))

            expect(removeEventHandlerSpy).toHaveBeenCalled()
        })
    })
})
