// Keep native table semantics while giving narrow screens a keyboard-scrollable region.
export default function rehypeWrapTables() {
  return function transform(node) {
    if (!Array.isArray(node.children)) return

    node.children = node.children.map(child => {
      if (child.type === 'element' && child.tagName === 'table') {
        return {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['article-table-scroll'],
            role: 'region',
            'aria-label': 'Scrollable table',
            tabIndex: 0,
          },
          children: [child],
        }
      }
      transform(child)
      return child
    })
  }
}
