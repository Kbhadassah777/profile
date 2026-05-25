import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const BASE_URL = 'https://kbhadassah777.github.io/profile'
const SITE_NAME = 'Blessy Hadassa Konedana'

const writingIds = [
  'multiagent-cost',
  'same-commands-different-code',
  'gpt2-blog',
  'context-blog',
  'multiagent-blog',
  'framework-blog',
  'context-preprint',
]

function escAttr(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const template = readFileSync(join(root, 'dist/index.html'), 'utf8')

for (const id of writingIds) {
  let mod
  try {
    mod = await import(pathToFileURL(join(root, `src/data/writings/${id}.js`)).href)
  } catch {
    console.warn(`Skipping ${id} (could not import)`)
    continue
  }

  const w = mod.default
  if (w.status !== 'published') continue

  const title = escAttr(`${w.title} | ${SITE_NAME}`)
  const desc  = escAttr(w.desc || '')
  const url   = `${BASE_URL}/blog/${w.id}`

  const ogTags = `
    <meta name="description" content="${desc}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="${escAttr(SITE_NAME)}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:url" content="${url}">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">`

  const html = template
    .replace('<title>Blessy Hadassa</title>', `<title>${title}</title>`)
    .replace('</head>', `${ogTags}\n  </head>`)

  const dir = join(root, 'dist/blog', w.id)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), html, 'utf8')
  console.log(`  og: ${w.id}`)
}

console.log('done.')
