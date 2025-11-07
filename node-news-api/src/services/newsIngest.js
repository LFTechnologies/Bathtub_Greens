import axios from 'axios'

export async function fetchFromRapidAPI({ q = 'technology', lang = 'en', pageSize = 5 } = {}) {
  const url = process.env.RAPIDAPI_NEWS_URL
  const headers = {
    'x-rapidapi-key': process.env.RAPIDAPI_KEY,
    'x-rapidapi-host': process.env.RAPIDAPI_HOST
  }
  // Example for World News API search endpoint
  const params = { text: q, language: lang, number: pageSize, sort: 'publish-time'
    // adjust based on the provider you pick on RapidAPI
  }
  const { data } = await axios.get(url, { headers, params })
  return data
}