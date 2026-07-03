import { supabase } from "../lib/supabase"
import { sportForCategoryId } from "../lib/sports"

const BASE_URL = "https://vote4goat.com"

function buildSitemap(urls) {
  const entries = urls
    .map(({ loc, changefreq, priority }) => `
  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`)
    .join("")
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}
</urlset>`
}

export default function Sitemap() {
  return null
}

export async function getServerSideProps({ res }) {
  const staticUrls = [
    { loc: `${BASE_URL}/`, changefreq: "daily", priority: "1.0" },
    { loc: `${BASE_URL}/football`, changefreq: "hourly", priority: "0.9" },
    { loc: `${BASE_URL}/basketball`, changefreq: "hourly", priority: "0.9" },
  ]

  const { data } = await supabase
    .from("entity_rankings")
    .select("entity_category_id, entities(slug)")

  const playerUrls = (data || [])
    .filter((row) => row.entities?.slug)
    .map((row) => {
      const sport = sportForCategoryId(row.entity_category_id)
      return sport ? { loc: `${BASE_URL}/${sport}/${row.entities.slug}`, changefreq: "weekly", priority: "0.6" } : null
    })
    .filter(Boolean)

  res.setHeader("Content-Type", "text/xml")
  res.write(buildSitemap([...staticUrls, ...playerUrls]))
  res.end()

  return { props: {} }
}
