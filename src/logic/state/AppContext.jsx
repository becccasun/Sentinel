import { createContext, useContext, useReducer, useMemo } from 'react'
import {
  accounts,
  transactions,
  subscriptions,
  investments,
  defaultGoals,
  trailingAverages,
  WEEK_START,
  WEEK_END,
} from '../../data/mockData'

const AppContext = createContext(null)

// ── Derived computation helpers ───────────────────────────────────────────────

function getThisWeekTxns(txns) {
  return txns.filter(t => t.date >= WEEK_START && t.date <= WEEK_END)
}

function getSpendingByCategory(txns) {
  const out = {}
  txns.forEach(t => {
    if (t.transfer) return
    out[t.category] = (out[t.category] || 0) + t.amount
  })
  return out
}

// Low=75%, Medium=40%, High=20% above trailing avg
const SENSITIVITY_THRESHOLDS = { low: 0.75, medium: 0.40, high: 0.20 }

function computeAnomalyFlags(byCategory, sensitivity) {
  const threshold = SENSITIVITY_THRESHOLDS[sensitivity]
  return Object.entries(trailingAverages)
    .filter(([cat, avg]) => {
      const spent = byCategory[cat] || 0
      return avg > 0 && spent > avg * (1 + threshold)
    })
    .map(([cat, avg]) => {
      const spent = byCategory[cat] || 0
      return { category: cat, spent, avg, pctAbove: Math.round(((spent - avg) / avg) * 100) }
    })
}

function computeAgentStatus(byCategory, goals, anomalyFlags) {
  const lim = goals.spendingLimits
  const checks = [
    { spent: byCategory['Dining']    || 0, limit: lim.weeklyDiningBudget          },
    { spent: byCategory['Groceries'] || 0, limit: lim.categoryLimits.Groceries    },
    { spent: byCategory['Shopping']  || 0, limit: lim.categoryLimits.Shopping     },
    { spent: byCategory['Transport'] || 0, limit: lim.categoryLimits.Transport    },
  ]
  const overLimit  = checks.some(c => c.limit > 0 && c.spent > c.limit)
  const nearLimit  = checks.some(c => c.limit > 0 && c.spent / c.limit >= 0.70)
  const highAnomaly = anomalyFlags.some(f => f.pctAbove > 50)

  if (overLimit || highAnomaly)                return 'Needs Attention'
  if (nearLimit || anomalyFlags.length > 0)    return 'Watch Mode'
  return 'On Track'
}

function computeSafeToSpend(txns, goals, subs, pendingSavings) {
  const weekTxns  = getThisWeekTxns(txns)
  const byCategory = getSpendingByCategory(weekTxns)
  const discretionary =
    (byCategory['Dining']    || 0) +
    (byCategory['Shopping']  || 0) +
    (byCategory['Transport'] || 0) +
    (byCategory['Groceries'] || 0)
  const upcomingRenewals = subs
    .filter(s => !s.paused && s.renewal >= WEEK_START && s.renewal <= '2026-07-20')
    .reduce((sum, s) => sum + s.cost, 0)
  return Math.max(
    0,
    goals.spendingLimits.weeklyDiscretionaryCap - discretionary - upcomingRenewals - pendingSavings
  )
}

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {
    case 'SET_DINING_BUDGET':
      return {
        ...state,
        goals: {
          ...state.goals,
          spendingLimits: { ...state.goals.spendingLimits, weeklyDiningBudget: action.value },
        },
      }
    case 'SET_WEEKLY_CAP':
      return {
        ...state,
        goals: {
          ...state.goals,
          spendingLimits: { ...state.goals.spendingLimits, weeklyDiscretionaryCap: action.value },
        },
      }
    case 'SET_CATEGORY_LIMIT':
      return {
        ...state,
        goals: {
          ...state.goals,
          spendingLimits: {
            ...state.goals.spendingLimits,
            categoryLimits: { ...state.goals.spendingLimits.categoryLimits, [action.category]: action.value },
          },
        },
      }
    case 'SET_SUBSCRIPTION_CAP':
      return {
        ...state,
        goals: {
          ...state.goals,
          subscriptionRules: { ...state.goals.subscriptionRules, monthlyCap: action.value },
        },
      }
    case 'SET_UNUSED_FLAG_DAYS':
      return {
        ...state,
        goals: {
          ...state.goals,
          subscriptionRules: { ...state.goals.subscriptionRules, unusedFlagDays: action.value },
        },
      }
    case 'TOGGLE_UNUSED_FLAG':
      return {
        ...state,
        goals: {
          ...state.goals,
          subscriptionRules: { ...state.goals.subscriptionRules, flagUnused: action.value },
        },
      }
    case 'SET_MAX_SINGLE_STOCK':
      return {
        ...state,
        goals: {
          ...state.goals,
          investingGuardrails: { ...state.goals.investingGuardrails, maxSingleStockExposure: action.value },
        },
      }
    case 'SET_MAX_THEME_PCT':
      return {
        ...state,
        goals: {
          ...state.goals,
          investingGuardrails: {
            ...state.goals.investingGuardrails,
            maxThemeExposure: { ...state.goals.investingGuardrails.maxThemeExposure, pct: action.value },
          },
        },
      }
    case 'UPDATE_SAVINGS_GOAL':
      return {
        ...state,
        goals: {
          ...state.goals,
          savingsGoals: state.goals.savingsGoals.map(g =>
            g.id === action.id ? { ...g, ...action.updates } : g
          ),
        },
      }
    case 'SET_ANOMALY_SENSITIVITY':
      return {
        ...state,
        goals: {
          ...state.goals,
          notificationSettings: { ...state.goals.notificationSettings, anomalySensitivity: action.value },
        },
      }
    case 'SET_CADENCE':
      return {
        ...state,
        goals: {
          ...state.goals,
          notificationSettings: { ...state.goals.notificationSettings, cadence: action.value },
        },
      }
    case 'SET_QUIET_HOURS':
      return {
        ...state,
        goals: {
          ...state.goals,
          notificationSettings: { ...state.goals.notificationSettings, quietHours: action.value },
        },
      }
    case 'TOGGLE_SMS':
      return {
        ...state,
        goals: {
          ...state.goals,
          notificationSettings: {
            ...state.goals.notificationSettings,
            channels: { ...state.goals.notificationSettings.channels, sms: action.value },
          },
        },
      }
    case 'PAUSE_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: state.subscriptions.map(s =>
          s.id === action.id ? { ...s, paused: !s.paused } : s
        ),
      }
    case 'MOVE_TO_SAVINGS': {
      const newSavings = state.pendingSavingsTransfers + action.amount
      const newGoals = {
        ...state.goals,
        savingsGoals: state.goals.savingsGoals.map(g =>
          g.id === action.goalId
            ? { ...g, current: Math.min(g.current + action.amount, g.target) }
            : g
        ),
      }
      const newAccounts = state.accounts.map(a =>
        a.id === 'chase-checking' ? { ...a, balance: a.balance - action.amount } : a
      )
      return { ...state, goals: newGoals, accounts: newAccounts, pendingSavingsTransfers: newSavings }
    }
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatMessages: [...state.chatMessages, action.message] }
    case 'SET_CHECKIN_TEXT':
      return { ...state, lastCheckinText: action.text }
    default:
      return state
  }
}

const initialState = {
  accounts:    [...accounts],
  transactions: [...transactions],
  subscriptions: subscriptions.map(s => ({ ...s })),
  investments,
  goals: { ...defaultGoals, savingsGoals: defaultGoals.savingsGoals.map(g => ({ ...g })) },
  chatMessages: [],
  lastCheckinText: null,
  pendingSavingsTransfers: 0,
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const derived = useMemo(() => {
    const thisWeekTxns    = getThisWeekTxns(state.transactions)
    const byCategory      = getSpendingByCategory(thisWeekTxns)
    const sensitivity     = state.goals.notificationSettings.anomalySensitivity
    const anomalyFlags    = computeAnomalyFlags(byCategory, sensitivity)
    const agentStatus     = computeAgentStatus(byCategory, state.goals, anomalyFlags)
    const safeToSpend     = computeSafeToSpend(
      state.transactions, state.goals, state.subscriptions, state.pendingSavingsTransfers
    )
    const upcomingRenewals = state.subscriptions.filter(
      s => !s.paused && s.renewal >= WEEK_START && s.renewal <= '2026-07-25'
    )
    const cashBalance   = state.accounts.filter(a => a.type === 'cash').reduce((s, a) => s + a.balance, 0)
    const creditBalance = state.accounts.filter(a => a.type === 'credit').reduce((s, a) => s + a.balance, 0)
    const investBalance = state.accounts.filter(a => a.type === 'investment').reduce((s, a) => s + a.balance, 0)

    return {
      thisWeekTxns,
      byCategory,
      anomalyFlags,
      agentStatus,
      safeToSpend,
      upcomingRenewals,
      cashBalance,
      creditBalance,
      investBalance,
    }
  }, [state.transactions, state.goals, state.subscriptions, state.accounts, state.pendingSavingsTransfers])

  return (
    <AppContext.Provider value={{ state, dispatch, derived }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
