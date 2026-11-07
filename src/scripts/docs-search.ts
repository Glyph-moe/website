import type { SearchEntry } from '../lib/searchIndex.ts'

// Declared non-null so the handlers below can use them without re-checking on
// every call; the guard under them still runs before anything is bound, which
// keeps the script inert on pages that do not render the search dialog.
const dialog = document.querySelector<HTMLDialogElement>('[data-docs-search-dialog]')!
const input = document.querySelector<HTMLInputElement>('[data-docs-search-input]')!
const resultsElement = document.querySelector<HTMLUListElement>('[data-docs-search-results]')!
const statusElement = document.querySelector<HTMLElement>('[data-docs-search-status]')!
const indexElement = document.querySelector<HTMLScriptElement>('[data-docs-search-index]')
const triggers = [...document.querySelectorAll<HTMLButtonElement>('[data-docs-search-open]')]

if (dialog && input && resultsElement && statusElement && indexElement && triggers.length) {
  let index: SearchEntry[] = []
  try {
    index = JSON.parse(indexElement.textContent || '[]')
  } catch {
    index = []
  }

  let active = -1
  let current: SearchEntry[] = []
  let lastTrigger: HTMLButtonElement | null = null

  function score(item: SearchEntry, query: string) {
    if (!query) return 1
    const title = item.title.toLowerCase()
    const description = item.description.toLowerCase()
    const section = item.section.toLowerCase()
    const headings = item.headings.toLowerCase()
    const q = query.toLowerCase()
    if (title === q) return 100
    if (title.startsWith(q)) return 80
    if (title.includes(q)) return 60
    if (headings.includes(q)) return 55
    if (description.includes(q)) return 40
    if (section.includes(q)) return 30
    const parts = q.split(/\s+/).filter(Boolean)
    const blob = `${title} ${description} ${section} ${headings}`
    return parts.length > 1 && parts.every(part => blob.includes(part)) ? 20 : 0
  }

  function updateActive() {
    const items = resultsElement.querySelectorAll<HTMLAnchorElement>('.docs-search-item')
    items.forEach((item, itemIndex) => {
      item.classList.toggle('active', itemIndex === active)
      if (itemIndex === active) item.setAttribute('aria-current', 'true')
      else item.removeAttribute('aria-current')
    })
    if (active >= 0) items[active]?.scrollIntoView({ block: 'nearest' })
  }

  function render(query: string) {
    const q = query.trim()
    const matches = index
      .map(item => ({ item, score: score(item, q) }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
    current = matches.slice(0, 12).map(result => result.item)
    active = current.length ? 0 : -1
    resultsElement.replaceChildren()
    statusElement.textContent = matches.length
      ? `${matches.length} ${matches.length === 1 ? 'result' : 'results'}`
      : `No results for “${q}”`

    if (!current.length) {
      const empty = document.createElement('li')
      empty.className = 'docs-search-empty'
      empty.textContent = 'Try a broader phrase, or browse all the guides below.'
      resultsElement.appendChild(empty)
      return
    }

    current.forEach((item, itemIndex) => {
      const row = document.createElement('li')
      const link = document.createElement('a')
      link.href = `/docs/${item.slug}`
      link.className = 'docs-search-item'
      const text = document.createElement('span')
      text.className = 'docs-search-item-text'
      const title = document.createElement('span')
      title.className = 'docs-search-item-title'
      title.textContent = item.title
      const description = document.createElement('span')
      description.className = 'docs-search-item-description'
      description.textContent = item.description
      const section = document.createElement('span')
      section.className = 'docs-search-item-section'
      section.textContent = item.section
      text.append(title, description)
      link.append(text, section)
      link.addEventListener('mouseenter', () => {
        active = itemIndex
        updateActive()
      })
      row.appendChild(link)
      resultsElement.appendChild(row)
    })
    updateActive()
  }

  function open(trigger: HTMLButtonElement) {
    lastTrigger = trigger
    input.value = ''
    render('')
    if (!dialog.open) dialog.showModal()
    requestAnimationFrame(() => input.focus())
  }

  triggers.forEach(trigger => trigger.addEventListener('click', () => open(trigger)))
  input.addEventListener('input', () => render(input.value))
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!current.length) return
      const direction = event.key === 'ArrowDown' ? 1 : -1
      active = (active + direction + current.length) % current.length
      updateActive()
    } else if (event.key === 'Enter' && active >= 0 && current[active]) {
      event.preventDefault()
      window.location.href = `/docs/${current[active].slug}`
    } else if (event.key === 'Escape') {
      // A search input consumes Escape to clear itself in Chrome. Close the
      // owning dialog instead so the keyboard contract is consistent.
      event.preventDefault()
      dialog.close()
    }
  })
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close()
  })
  dialog.addEventListener('close', () => {
    input.value = ''
    active = -1
    lastTrigger?.focus()
  })
  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      if (dialog.open) dialog.close()
      else open(triggers[0])
    }
  })
}
