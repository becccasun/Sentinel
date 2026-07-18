export async function generateCheckinText(snapshot) {
  try {
    const res = await fetch('/api/generate-checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snapshot }),
    })
    const data = await res.json()
    return { text: data.text, source: data.source }
  } catch {
    return { text: null, source: 'error' }
  }
}

export async function sendSMS(text) {
  try {
    const res = await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    return await res.json()
  } catch {
    return { success: false, error: 'Network error' }
  }
}
