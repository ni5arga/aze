import { getJson, HttpError } from './http.js'

export interface WikiSummary {
  title: string
  description?: string
  extract: string
  content_urls: { desktop: { page: string } }
  thumbnail?: { source: string; width: number; height: number }
  type: string
}

const summaryUrl = (title: string): string =>
  `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/\s+/g, '_'))}`

const fetchSummary = (title: string): Promise<WikiSummary> => getJson<WikiSummary>(summaryUrl(title))

const opensearch = async (query: string): Promise<string | null> => {
  const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&namespace=0&format=json`
  const data = await getJson<[string, string[], string[], string[]]>(url)
  return data[1]?.[0] ?? null
}

export const fetchWikiSummary = async (query: string): Promise<WikiSummary> => {
  try {
    return await fetchSummary(query)
  } catch (err) {
    if (!(err instanceof HttpError) || err.status !== 404) throw err
    const hit = await opensearch(query)
    if (!hit) throw new Error(`No Wikipedia article matches "${query}".`)
    return fetchSummary(hit)
  }
}
