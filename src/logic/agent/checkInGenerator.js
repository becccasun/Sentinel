export function buildLocalCheckIn(state, derived) {
  const { safeToSpend, byCategory, anomalyFlags, upcomingRenewals, agentStatus } = derived
  const { investments, goals } = state

  const diningSpent   = byCategory['Dining'] || 0
  const diningTrailing = 75.50
  const diningPct     = Math.round(((diningSpent - diningTrailing) / diningTrailing) * 100)

  const topHoldings = investments.holdings
    .filter(h => h.weeklyChange > 0)
    .sort((a, b) => b.weeklyChange - a.weeklyChange)
    .slice(0, 2)
    .map(h => h.ticker)
    .join(' and ')

  const renewalCount = upcomingRenewals.length
  const renewalNames = upcomingRenewals.slice(0, 3).map(r => r.merchant).join(', ')

  const savingGoal = goals.savingsGoals.find(g => g.id === 'sg-trip') || goals.savingsGoals[0]

  const parts = []
  parts.push(`Money Sentinel — Friday Check-In`)
  parts.push(``)
  parts.push(`Safe to spend this week: $${Math.round(safeToSpend)}`)
  parts.push(``)

  if (diningPct > 0) {
    parts.push(`Dining is up ${diningPct}% vs your usual pace ($${Math.round(diningSpent)} so far).`)
  }

  if (investments.weeklyChange > 0 && topHoldings) {
    parts.push(`Robinhood is up $${investments.weeklyChange}, mostly ${topHoldings}.`)
  }

  if (renewalCount > 0) {
    parts.push(`${renewalCount} renewal${renewalCount > 1 ? 's' : ''} coming up: ${renewalNames}.`)
  }

  parts.push(``)

  if (anomalyFlags.some(f => f.category === 'Dining')) {
    const savingsShortfall = savingGoal.target - savingGoal.current
    const suggested = Math.min(75, Math.floor(savingsShortfall / 10) * 10 || 75)
    parts.push(`Suggested: pause DoorDash this week, move $${suggested} to savings.`)
  } else if (agentStatus === 'On Track') {
    parts.push(`You're on track this week — no action needed.`)
  } else {
    parts.push(`Worth a look before the week closes.`)
  }

  parts.push(`Reply to act, or just ignore this if you're on track.`)

  return parts.join('\n')
}

export function buildSnapshotForAPI(state, derived) {
  return {
    safeToSpend:    Math.round(derived.safeToSpend),
    agentStatus:    derived.agentStatus,
    spendingByCategory: derived.byCategory,
    anomalyFlags:   derived.anomalyFlags,
    upcomingRenewals: derived.upcomingRenewals,
    investmentChange: state.investments.weeklyChange,
    savingsGoals:   state.goals.savingsGoals,
  }
}
