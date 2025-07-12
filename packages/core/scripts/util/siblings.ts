export function siblings(elem: Element | undefined) {
    const siblings: Element[] = []
    if (!elem?.parentNode) return siblings

    for (const sibling of elem.parentNode.children) {
        if (sibling.nodeType !== 1 || sibling === elem) continue
        siblings.push(sibling)
    }

    return siblings
}
