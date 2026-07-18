const MERCHANT_ALIASES = {
  doordash:  'sub-doordash',
  netflix:   'sub-netflix',
  spotify:   'sub-spotify',
  figma:     'sub-figma',
  peacock:   'sub-peacock',
  notion:    'sub-notion',
}

export function parseReply(text, state) {
  const lower  = text.toLowerCase()
  const intents = []

  // Pause / cancel subscription or delivery service
  Object.entries(MERCHANT_ALIASES).forEach(([alias, defaultId]) => {
    if (lower.includes(alias)) {
      const sub = state.subscriptions.find(s => s.merchant.toLowerCase() === alias)
      if (sub && !sub.paused) {
        intents.push({ type: 'PAUSE_SUBSCRIPTION', subId: sub.id, merchant: sub.merchant, cost: sub.cost })
      } else if (!sub) {
        // DoorDash-style behavioral commitment (no subscription row)
        intents.push({ type: 'BEHAVIORAL_PAUSE', merchant: alias, displayName: alias.charAt(0).toUpperCase() + alias.slice(1) })
      }
    }
  })

  // Move/transfer to savings
  const savingsRe = /(?:move|transfer|put|send)\s+\$?(\d+(?:\.\d+)?)\s+(?:to|into)\s+savings/i
  const savingsMatch = text.match(savingsRe)
  if (savingsMatch) {
    const amount   = parseFloat(savingsMatch[1])
    const goal     = state.goals.savingsGoals.find(g => g.id === 'sg-trip') || state.goals.savingsGoals[0]
    intents.push({ type: 'MOVE_SAVINGS', amount, goalId: goal.id, goalName: goal.name })
  }

  // Balance / status check
  if (/how am i doing|what's my balance|how much.*left|safe to spend/i.test(lower)) {
    intents.push({ type: 'STATUS_CHECK' })
  }

  return intents
}

export function buildConfirmation(intents, state, derived) {
  if (intents.length === 0) {
    return "Got it. I didn't catch a specific action — try something like \"pause DoorDash\" or \"move $75 to savings\"."
  }

  const lines = []

  intents.forEach(intent => {
    if (intent.type === 'PAUSE_SUBSCRIPTION') {
      lines.push(`✓ ${intent.merchant} paused. That's $${intent.cost.toFixed(2)} saved this billing cycle.`)
    }
    if (intent.type === 'BEHAVIORAL_PAUSE') {
      lines.push(`✓ Got it — committed to skipping ${intent.displayName} this week. That's ~$35 back.`)
    }
    if (intent.type === 'MOVE_SAVINGS') {
      lines.push(`✓ Moved $${intent.amount} to your ${intent.goalName} fund.`)
    }
    if (intent.type === 'STATUS_CHECK') {
      lines.push(`You're in ${derived.agentStatus} mode.`)
    }
  })

  lines.push('')
  lines.push(`Safe to spend now: $${Math.round(derived.safeToSpend)}`)

  return lines.join('\n')
}
