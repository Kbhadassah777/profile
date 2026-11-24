import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const BASE_URL = 'https://kbhadassah777.github.io/profile'
const SITE_NAME = 'Blessy Hadassa Konedana'

const writingIds = [
  'tutor-copilot-analysis',
  'multiagent-tutoring',
  'multiagent-cost',
  'same-commands-different-code',
  'gpt2-blog',
]

function escAttr(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// strip the homepage's own description/OG/Twitter tags so per-post pages
// don't end up with two conflicting sets of the same meta properties
const template = readFileSync(join(root, 'dist/index.html'), 'utf8')
  .replace(/\n?\s*<meta (?:name="(?:description|twitter:[^"]*)"|property="og:[^"]*") content="[^"]*"\s*\/?>/g, '')

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

  const title   = escAttr(`${w.title} | ${SITE_NAME}`)
  const desc    = escAttr(w.desc || '')
  const urlPath = w.route || `/blog/${w.id}`
  const url     = `${BASE_URL}${urlPath}`
  const image   = `${BASE_URL}/og-image.png`

  const ogTags = `
    <meta name="description" content="${desc}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="${escAttr(SITE_NAME)}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${image}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="${image}">`

  const html = template
    .replace('<title>Blessy Hadassa</title>', `<title>${title}</title>`)
    .replace('</head>', `${ogTags}\n  </head>`)

  const dir = join(root, 'dist', urlPath.replace(/^\//, ''))
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), html, 'utf8')
  console.log(`  og: ${urlPath}`)
}

console.log('done.')
