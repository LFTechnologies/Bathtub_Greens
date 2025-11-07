import cron from 'node-cron'
import axios from 'axios'

export function initCron() {
  const spec = process.env.CRON_INGEST
  if (!spec) return
  console.log('Cron ingest on', spec)
  cron.schedule(spec, async () => {
    try {
      // Call your own endpoint to reuse auth/logic; you can also inline ingest here.
      await axios.post(`http://localhost:${process.env.PORT || 4000}/api/ingest/rapidapi/search`, {
        q: 'technology', language: 'en', limit: 3
      }, { headers: { Authorization: `Bearer ${process.env.CRON_TOKEN || ''}` } })
      console.log('Ingest task completed')
    } catch (e) {
      console.error('Ingest failed', e?.response?.data || e.message)
    }
  })
}