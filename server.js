import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import OpenAI from 'openai'

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const FALLBACK_SMS = `Money Sentinel — Friday Check-In

Safe to spend this week: $279

Dining is up 43% vs your usual pace ($108 so far).
Robinhood is up $320, mostly NVDA and VOO.
2 renewals before Sunday: Spotify, Netflix.

Suggested: pause DoorDash this week, move $75 to savings.
Reply in the app to act, or ignore if you're on track.`

app.post('/api/generate-checkin', async (req, res) => {
  const { snapshot } = req.body

  if (!openai) {
    return res.json({ text: FALLBACK_SMS, source: 'fallback' })
  }

  const prompt = buildPrompt(snapshot)

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are Money Sentinel, a personal AI finance agent texting a young professional.
Write a brief, direct SMS check-in. Rules:
- Start with "Money Sentinel — [day] Check-In"
- Lead with "Safe to spend this week: $X"
- Mention 1-2 specific anomalies with exact dollar figures
- One concrete action suggestion
- End with "Reply to act, or just ignore this if you're on track."
- No bullet points — plain text, paragraph style
- Max 160 words`,
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 250,
    })
    res.json({ text: completion.choices[0].message.content, source: 'openai' })
  } catch (err) {
    console.error('OpenAI error:', err.message)
    res.json({ text: FALLBACK_SMS, source: 'fallback' })
  }
})

app.post('/api/send-sms', async (req, res) => {
  const { text } = req.body

  // Supports both auth methods:
  // 1. Classic: TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN
  // 2. API Key:  TWILIO_API_KEY (SK...) + TWILIO_API_SECRET + TWILIO_ACCOUNT_SID
  const accountSid  = process.env.TWILIO_ACCOUNT_SID
  const authToken   = process.env.TWILIO_AUTH_TOKEN
  const apiKey      = process.env.TWILIO_API_KEY
  const apiSecret   = process.env.TWILIO_API_SECRET
  const from        = process.env.TWILIO_FROM_NUMBER
  const to          = process.env.DEMO_PHONE_NUMBER

  const hasClassic = accountSid && authToken && from && to
  const hasApiKey  = apiKey?.startsWith('SK') && apiSecret && accountSid && from && to

  if (!hasClassic && !hasApiKey) {
    console.log('\n📱 [SIMULATED SMS]\n' + text + '\n')
    return res.json({ success: true, simulated: true })
  }

  try {
    const { default: twilio } = await import('twilio')
    let client
    if (hasApiKey) {
      client = twilio(apiKey, apiSecret, { accountSid })
    } else {
      client = twilio(accountSid, authToken)
    }
    const msg = await client.messages.create({ body: text, from, to })
    res.json({ success: true, sid: msg.sid })
  } catch (err) {
    console.error('Twilio error:', err.message)
    res.json({ success: false, error: err.message })
  }
})

function buildPrompt(s) {
  return `Financial snapshot:
- Safe to spend this week: $${s.safeToSpend}
- Agent status: ${s.agentStatus}
- Spending this week: ${Object.entries(s.spendingByCategory).map(([k, v]) => `${k} $${v.toFixed(0)}`).join(', ')}
- Anomalies: ${s.anomalyFlags.map(f => `${f.category} is ${f.pctAbove}% above trailing avg`).join('; ') || 'none'}
- Upcoming renewals: ${s.upcomingRenewals.map(r => `${r.merchant} $${r.cost}`).join(', ') || 'none'}
- Robinhood this week: +$${s.investmentChange} (NVDA, VOO)
- Savings goals: ${s.savingsGoals.map(g => `${g.name}: $${g.current}/$${g.target}`).join(', ')}`
}

app.listen(3001, () => console.log('Money Sentinel API running on :3001'))
