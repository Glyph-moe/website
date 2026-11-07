const languageNames: Record<string, string> = {
  ts: 'TypeScript',
  typescript: 'TypeScript',
  js: 'JavaScript',
  javascript: 'JavaScript',
  sh: 'Shell',
  bash: 'Bash',
  shell: 'Shell',
  json: 'JSON',
  rust: 'Rust',
  toml: 'TOML',
  yaml: 'YAML',
  yml: 'YAML',
  md: 'Markdown',
  markdown: 'Markdown',
  html: 'HTML',
  css: 'CSS',
  wit: 'WIT',
  text: 'Plain text',
  plaintext: 'Plain text',
}

for (const pre of document.querySelectorAll<HTMLElement>('.article-body pre:not(.cli-output)')) {
  const code = pre.querySelector('code')
  const className = `${pre.className} ${code?.className || ''}`
  const language = className.match(/language-([\w-]+)/)?.[1]?.toLowerCase() || 'text'
  const label = languageNames[language] || language
  const parent = pre.parentElement
  if (!parent) continue

  const block = document.createElement('div')
  block.className = 'code-block'
  parent.insertBefore(block, pre)

  const header = document.createElement('div')
  header.className = 'code-header'
  const languageLabel = document.createElement('span')
  languageLabel.className = 'code-language'
  languageLabel.textContent = label

  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'code-copy'
  button.setAttribute('data-code-copy', '')
  button.setAttribute('aria-label', `Copy ${label} code`)
  button.textContent = 'Copy'

  const status = document.createElement('span')
  status.className = 'sr-only'
  status.setAttribute('data-copy-status', '')
  status.setAttribute('role', 'status')
  status.setAttribute('aria-live', 'polite')

  header.append(languageLabel, button, status)
  block.append(header, pre)
  pre.tabIndex = 0
  pre.setAttribute('aria-label', `${label} code sample`)

  let resetTimer = 0
  button.addEventListener('click', async () => {
    window.clearTimeout(resetTimer)
    try {
      if (!navigator.clipboard) throw new Error('Clipboard API unavailable')
      await navigator.clipboard.writeText(code?.textContent || pre.textContent || '')
      button.textContent = 'Copied'
      status.textContent = 'Copied to clipboard.'
    } catch {
      button.textContent = 'Try again'
      status.textContent = 'Copy failed. Select the code and copy it manually.'
    }
    resetTimer = window.setTimeout(() => {
      button.textContent = 'Copy'
      status.textContent = ''
    }, 2400)
  })
}

const tocLinks = [...document.querySelectorAll<HTMLAnchorElement>('.docs-toc-link')]
const tocItems = tocLinks
  .map(link => {
    const slug = link.dataset.slug || ''
    const heading = document.getElementById(slug)
    return heading ? { link, heading, slug } : null
  })
  .filter((item): item is { link: HTMLAnchorElement; heading: HTMLElement; slug: string } =>
    Boolean(item),
  )

if (tocItems.length) {
  let clickGuard = 0
  const visible = new Set<string>()

  function setActive(slug: string) {
    for (const item of tocItems) {
      const active = item.slug === slug
      item.link.classList.toggle('active', active)
      if (active) item.link.setAttribute('aria-current', 'location')
      else item.link.removeAttribute('aria-current')
    }
  }

  const initial = location.hash.slice(1)
  setActive(tocItems.some(item => item.slug === initial) ? initial : tocItems[0].slug)

  for (const item of tocItems) {
    item.link.addEventListener('click', () => {
      setActive(item.slug)
      clickGuard = Date.now() + 800
    })
  }

  const observer = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id)
        else visible.delete(entry.target.id)
      }
      if (Date.now() < clickGuard) return
      const current = tocItems.find(item => visible.has(item.slug))
      if (current) setActive(current.slug)
    },
    { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
  )

  for (const item of tocItems) observer.observe(item.heading)
}
