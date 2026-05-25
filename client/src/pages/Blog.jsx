import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { WRITINGS } from '../data/writings/index.js'
import '../styles/blog.css'

function formatDate(str) {
  if (!str) return ''
  return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function BlogNav() {
  return (
    <nav className="nav">
      <div className="nav__inner">
        <Link to="/" className="nav__logo">BH</Link>
        <ul className="nav__links">
          <li><Link to="/" className="nav__link">home</Link></li>
          <li><Link to="/blog" className="nav__link">writing</Link></li>
        </ul>
      </div>
    </nav>
  )
}

/* ── Blog listing ─────────────────────────────────────────────────────────── */

function PostList() {
  const published = WRITINGS.filter(w => w.status === 'published')
  const upcoming  = WRITINGS.filter(w => w.status !== 'published')

  return (
    <div className="blog-page">
      <BlogNav />
      <main className="blog-main">
        <div className="blog-hero">
          <span className="eyebrow">pen &amp; paper</span>
          <h1 className="headline">things I <span className="headline-gradient">wrote.</span></h1>
          <p className="subtext">blogs, pre-prints, half-baked thoughts. occasionally coherent.</p>
        </div>

        {published.length > 0 && (
          <div className="blog-grid">
            {published.map(w => (
              <Link key={w.id} to={`/blog/${w.id}`} className="blog-card">
                {w.thumbnail && (
                  <div className="blog-card__thumb-wrap">
                    <img src={w.thumbnail} alt="" className="blog-card__thumb" />
                  </div>
                )}
                <div className="blog-card__body">
                  {w.date && <span className="blog-card__date">{formatDate(w.date)}</span>}
                  <span className="blog-card__type">{w.type === 'blog' ? 'blog' : 'pre-print'}</span>
                  <h2 className="blog-card__title">{w.title}</h2>
                  <p className="blog-card__excerpt">{w.desc}</p>
                  <span className="blog-card__cta">read →</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {upcoming.length > 0 && (
          <div className="blog-upcoming">
            <h3 className="blog-upcoming__label">coming soon</h3>
            {upcoming.map(w => (
              <div key={w.id} className="blog-upcoming__row">
                <span className="blog-upcoming__title">{w.title}</span>
                <span className={`status-pill status-pill--${w.status}`}>
                  {w.status === 'coming-soon' ? 'coming soon' : 'in progress'}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

/* ── Post view ────────────────────────────────────────────────────────────── */

function PostView({ slug }) {
  const meta = WRITINGS.find(w => w.id === slug)
  const [post, setPost]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!meta?.feedUrl || !meta?.url) { setLoading(false); return }

    const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(meta.feedUrl)}&count=50`
    fetch(api)
      .then(r => r.json())
      .then(data => {
        const item = data.items?.find(i => i.link === meta.url || i.guid === meta.url)
        if (item) setPost(item)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug, meta?.feedUrl, meta?.url])

  return (
    <div className="blog-page">
      <BlogNav />
      <main className="blog-main blog-main--post">
        <Link to="/blog" className="blog-back">← back to writing</Link>

        {loading && <div className="blog-loading">fetching article...</div>}

        {!loading && (
          <article className="blog-article">
            <header className="blog-article__header">
              {(post?.pubDate || meta?.date) && (
                <span className="blog-article__date">{formatDate(post?.pubDate || meta?.date)}</span>
              )}
              <h1 className="blog-article__title">{post?.title || meta?.title}</h1>
              {meta?.subtitle && <p className="blog-article__subtitle">{meta.subtitle}</p>}
              {(post?.thumbnail || meta?.thumbnail) && (
                <img src={post?.thumbnail || meta.thumbnail} alt="" className="blog-article__thumb" />
              )}
            </header>

            {(post?.content || meta?.content)
              ? <div className="blog-article__body" dangerouslySetInnerHTML={{ __html: post?.content || meta.content }} />
              : (
                <div className="blog-article__fallback">
                  <p>{meta?.desc}</p>
                  {meta?.url && (
                    <a href={meta.url} target="_blank" rel="noopener noreferrer" className="blog-article__medium-link">
                      read the full article on medium ↗
                    </a>
                  )}
                </div>
              )
            }

            {post?.link && (
              <a href={post.link} target="_blank" rel="noopener noreferrer" className="blog-article__medium-link">
                view original on medium ↗
              </a>
            )}
          </article>
        )}
      </main>
    </div>
  )
}

/* ── Router ───────────────────────────────────────────────────────────────── */

export default function Blog() {
  const { slug } = useParams()
  if (slug) return <PostView slug={slug} />
  return <PostList />
}
