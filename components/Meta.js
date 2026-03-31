import Head from 'next/head'

export default function Meta({ title, description, url }) {
  const defaultTitle = 'Vote4GOAT — The world decides who is the GOAT'
  const defaultDesc = 'Vote in 1v1 duels, build your Top 10 and rank the greatest athletes of all time. The only ranking built by the world.'
  const defaultUrl = 'https://vote4goat.com'

  const t = title ? `${title} | Vote4GOAT` : defaultTitle
  const d = description || defaultDesc
  const u = url ? `${defaultUrl}${url}` : defaultUrl

  return (
    <Head>
      <title>{t}</title>
      <meta name="description" content={d} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={u} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={t} />
      <meta property="og:description" content={d} />
      <meta property="og:url" content={u} />
      <meta property="og:image" content="https://vote4goat.com/og-image.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Vote4GOAT" />

      {/* Twitter/X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={t} />
      <meta name="twitter:description" content={d} />
      <meta name="twitter:image" content="https://vote4goat.com/og-image.png" />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
    </Head>
  )
}
