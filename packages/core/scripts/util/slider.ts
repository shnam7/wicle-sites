// Utility functions for slide animations
const defaultDuration = 300

export function slideDown(element?: HTMLElement, duration = defaultDuration) {
    if (!element) return
    element.style.overflow = 'hidden'
    element.style.height = '0'
    element.style.display = 'block'

    const height = element.scrollHeight
    element.style.transition = `height ${duration}ms ease`
    element.style.height = `${height}px`

    setTimeout(() => {
        element.style.height = ''
        element.style.overflow = ''
        element.style.transition = ''
    }, duration)
}

export function slideUp(element?: HTMLElement, duration: number = defaultDuration) {
    if (!element) return
    element.style.overflow = 'hidden'
    element.style.height = `${element.offsetHeight}px`
    element.style.transition = `height ${duration}ms ease`

    setTimeout(() => {
        element.style.height = '0'
    }, 10)

    setTimeout(() => {
        element.style.display = 'none'
        element.style.height = ''
        element.style.overflow = ''
        element.style.transition = ''
    }, duration)
}
