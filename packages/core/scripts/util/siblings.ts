export function siblings(elem: Element | undefined) {
    const _siblings: Element[] = []
    if (!elem?.parentNode) return _siblings

    for (const sibling of elem.parentNode.children) {
        if (sibling.nodeType !== 1 || sibling === elem) continue
        _siblings.push(sibling)
    }

    return _siblings
}
