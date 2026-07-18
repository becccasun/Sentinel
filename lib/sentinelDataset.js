export const sentinelDataset = {
  "meta": {
    "source": "Sentinel web UI mock data (lib/data.js + lib/derive.js), normalized for backend use",
    "generatedAt": "2026-07-18",
    "currency": "USD",
    "referenceDate": "2026-07-18",
    "weekOf": { "start": "2026-07-13", "end": "2026-07-18" },
    "notes": [
      "All amounts are decimal dollars. Debits are negative, credits positive.",
      "Category totals reconcile exactly with the transactions ledger.",
      "expectedDerived holds the values the UI displays; use them as backend test fixtures.",
      "UI-only fields (tile colors, letters) are intentionally omitted."
    ]
  },

  "user": {
    "id": "user_alex_001",
    "name": "Alex",
    "email": "alex@example.com",
    "phone": "+17345550132",
    "reportSettings": {
      "channels": ["sms", "in_app"],
      "smsEnabled": true,
      "deliveryTimeLocal": "08:00",
      "timezone": "America/Detroit",
      "agentSmsNumber": "+18335550199",
      "cadence": "daily"
    }
  },

  "accounts": [
    { "id": "acct_chase_checking", "institution": "Chase",            "name": "Chase Checking",          "type": "checking",    "balance": 4820.12,  "lastSyncedAt": "2026-07-18T07:56:00-04:00" },
    { "id": "acct_chase_freedom",  "institution": "Chase",            "name": "Chase Freedom Unlimited", "type": "credit_card", "balance": -1240.55, "autopayDate": "2026-07-28", "lastSyncedAt": "2026-07-18T07:56:00-04:00" },
    { "id": "acct_amex_gold",      "institution": "American Express", "name": "AmEx Gold",               "type": "credit_card", "balance": -486.20,  "autopayDate": "2026-07-28", "lastSyncedAt": "2026-07-18T07:56:00-04:00" },
    { "id": "acct_robinhood",      "institution": "Robinhood",        "name": "Robinhood",               "type": "brokerage",   "balance": 12600.00, "lastSyncedAt": "2026-07-18T07:56:00-04:00" },
    { "id": "acct_apple_savings",  "institution": "Goldman Sachs",    "name": "Apple Savings",           "type": "savings",     "balance": 6150.00,  "apyPct": 4.1, "lastSyncedAt": "2026-07-18T07:56:00-04:00" }
  ],

  "connectablePlatforms": [
    { "id": "plat_boa",      "name": "Bank of America", "type": "bank",              "connected": false },
    { "id": "plat_cap1",     "name": "Capital One",     "type": "bank_and_cards",    "connected": false },
    { "id": "plat_venmo",    "name": "Venmo",           "type": "payments",          "connected": false },
    { "id": "plat_fidelity", "name": "Fidelity",        "type": "brokerage_and_401k","connected": false }
  ],

  "subscriptions": [
    { "id": "sub_spotify", "merchant": "Spotify Premium", "monthlyCost": 11.99, "renewsOn": "2026-07-22", "usageScore": 96, "lastUsedAt": "2026-07-18", "usageNote": "Daily, ~2.1 hrs/day",    "status": "active", "recommendation": "keep" },
    { "id": "sub_chatgpt", "merchant": "ChatGPT Plus",    "monthlyCost": 20.00, "renewsOn": "2026-08-02", "usageScore": 88, "lastUsedAt": "2026-07-18", "usageNote": "26 days this month",     "status": "active", "recommendation": "keep" },
    { "id": "sub_prime",   "merchant": "Amazon Prime",    "monthlyCost": 14.99, "renewsOn": "2026-08-09", "usageScore": 81, "lastUsedAt": "2026-07-17", "usageNote": "11 orders + video",      "status": "active", "recommendation": "keep" },
    { "id": "sub_netflix", "merchant": "Netflix",         "monthlyCost": 22.99, "renewsOn": "2026-07-24", "usageScore": 74, "lastUsedAt": "2026-07-16", "usageNote": "14 sessions this month", "status": "active", "recommendation": "keep" },
    { "id": "sub_notion",  "merchant": "Notion Plus",     "monthlyCost": 12.00, "renewsOn": "2026-07-21", "usageScore": 68, "lastUsedAt": "2026-07-18", "usageNote": "Work hours, weekdays",   "status": "active", "recommendation": "keep" },
    { "id": "sub_figma",   "merchant": "Figma Pro",       "monthlyCost": 15.00, "renewsOn": "2026-07-30", "usageScore": 31, "lastUsedAt": "2026-06-27", "usageNote": "2 sessions this month",  "status": "active", "recommendation": "review" },
    { "id": "sub_crunchy", "merchant": "Crunchyroll",     "monthlyCost": 7.99,  "renewsOn": "2026-07-27", "usageScore": 12, "lastUsedAt": "2026-06-13", "usageNote": "1 session this month",   "status": "active", "recommendation": "cancel_candidate" },
    { "id": "sub_peacock", "merchant": "Peacock Premium", "monthlyCost": 7.99,  "renewsOn": "2026-07-23", "usageScore": 6,  "lastUsedAt": "2026-06-01", "usageNote": "0 sessions this month",  "status": "active", "recommendation": "cancel_candidate" }
  ],

  "transactions": [
    { "id": "txn_001", "date": "2026-07-18", "merchant": "Blue Bottle Coffee",    "accountId": "acct_amex_gold",      "category": "dining",         "amount": -7.75 },
    { "id": "txn_002", "date": "2026-07-17", "merchant": "DoorDash, Thai Basil",  "accountId": "acct_chase_freedom",  "category": "dining",         "amount": -34.90 },
    { "id": "txn_003", "date": "2026-07-17", "merchant": "Whole Foods Market",    "accountId": "acct_chase_freedom",  "category": "groceries",      "amount": -86.42 },
    { "id": "txn_004", "date": "2026-07-16", "merchant": "Robinhood transfer",    "accountId": "acct_chase_checking", "category": "investing",      "amount": -200.00 },
    { "id": "txn_005", "date": "2026-07-16", "merchant": "Uber",                  "accountId": "acct_amex_gold",      "category": "transport",      "amount": -18.40 },
    { "id": "txn_006", "date": "2026-07-16", "merchant": "Zingerman’s Deli",      "accountId": "acct_amex_gold",      "category": "dining",         "amount": -36.40 },
    { "id": "txn_007", "date": "2026-07-15", "merchant": "Paycheck, Acme Corp",   "accountId": "acct_chase_checking", "category": "income",         "amount": 2140.00 },
    { "id": "txn_008", "date": "2026-07-15", "merchant": "Sweetgreen",            "accountId": "acct_amex_gold",      "category": "dining",         "amount": -16.85 },
    { "id": "txn_009", "date": "2026-07-15", "merchant": "Shell",                 "accountId": "acct_chase_freedom",  "category": "transport",      "amount": -42.10 },
    { "id": "txn_010", "date": "2026-07-14", "merchant": "DoorDash, Shake Shack", "accountId": "acct_chase_freedom",  "category": "dining",         "amount": -28.65 },
    { "id": "txn_011", "date": "2026-07-14", "merchant": "Trader Joe’s",          "accountId": "acct_chase_freedom",  "category": "groceries",      "amount": -54.20 },
    { "id": "txn_012", "date": "2026-07-13", "merchant": "Rent, Parkline Apts",   "accountId": "acct_chase_checking", "category": "rent_utilities", "amount": -1450.00 },
    { "id": "txn_013", "date": "2026-07-13", "merchant": "Cava",                  "accountId": "acct_amex_gold",      "category": "dining",         "amount": -14.30 },
    { "id": "txn_014", "date": "2026-07-13", "merchant": "Miss Kim",              "accountId": "acct_chase_freedom",  "category": "dining",         "amount": -57.70 },
    { "id": "txn_015", "date": "2026-07-12", "merchant": "Target",                "accountId": "acct_chase_freedom",  "category": "shopping",       "amount": -63.75 },
    { "id": "txn_016", "date": "2026-07-12", "merchant": "DoorDash, Chipotle",    "accountId": "acct_chase_freedom",  "category": "dining",         "amount": -21.45 }
  ],

  "weeklyBudgets": [
    { "category": "rent_utilities", "weeklyBudget": 1500, "spentThisWeek": 1450.00 },
    { "category": "dining",         "weeklyBudget": 150,  "spentThisWeek": 218.00 },
    { "category": "groceries",      "weeklyBudget": 180,  "spentThisWeek": 140.62 },
    { "category": "transport",      "weeklyBudget": 90,   "spentThisWeek": 60.50 },
    { "category": "shopping",       "weeklyBudget": 120,  "spentThisWeek": 63.75 },
    { "category": "investing",      "weeklyBudget": 200,  "spentThisWeek": 200.00 }
  ],

  "goals": [
    {
      "id": "goal_car",
      "type": "savings",
      "name": "Car down payment",
      "target": 9000,
      "saved": 5400,
      "monthlyContribution": 450,
      "etaMonths": 8,
      "etaDate": "2027-03"
    },
    {
      "id": "goal_emergency",
      "type": "emergency_fund",
      "name": "Emergency fund",
      "target": 8000,
      "saved": 6150,
      "accountId": "acct_apple_savings",
      "apyPct": 4.1
    }
  ],

  "guardrails": {
    "weeklyDiningBudget": 150,
    "monthlySubscriptionCap": 120,
    "weeklySafeToSpendTarget": 500,
    "maxSingleThemeExposurePct": 30
  },

  "portfolio": {
    "accountId": "acct_robinhood",
    "value": 12600.00,
    "weekChange": 320.00,
    "weekChangePct": 2.8,
    "topDrivers": ["NVDA", "VOO"],
    "aiExposurePct": 41
  },

  "reportHistory": [
    { "date": "2026-07-17", "summary": "Groceries trending 12% under budget. Paycheck landed ($2,140). No action needed." },
    { "date": "2026-07-16", "summary": "Flagged Peacock: unused for 45+ days. Suggested cancellation, saves $95.88/yr." },
    { "date": "2026-07-15", "summary": "Rent cleared. Cash cushion healthy at 3.2x weekly spend. Portfolio +1.1%." }
  ],

  "smsThreadSeed": [
    { "who": "user",  "text": "how much of that is doordash?" },
    { "who": "agent", "text": "DoorDash is $85.00 of your $218 dining spend (3 orders). Cancelling tonight's usual order keeps you under $377 safe-to-spend. Want me to nudge you at 6pm?" }
  ],

  "replyCommands": {
    "cancel": { "pattern": "^cancel\\s+(.+)$", "flags": "i", "effect": "deactivate matched subscription, redirect monthly cost to goal_car" },
    "keep":   { "pattern": "^keep\\s+(.+)$",   "flags": "i", "effect": "suppress future flags for matched subscription" }
  },

  "expectedDerived": {
    "comment": "Values the UI computes from the data above. Useful as backend test fixtures.",
    "totalCash": 10970.12,
    "cardDebt": 1726.75,
    "subscriptionMonthlyTotal": 112.95,
    "subscriptionAnnualTotal": 1355.40,
    "lowUseMonthlySpend": 15.98,
    "diningSpentThisWeek": 218.00,
    "diningOverBudgetPct": 45,
    "doordashDiningPortion": 85.00,
    "weeklyDiscretionarySpend": 482.87,
    "renewalsBeforeFriday": { "subscriptionIds": ["sub_notion", "sub_spotify", "sub_peacock", "sub_netflix"], "total": 54.97 },
    "safeToSpendBeforeFriday": 377,
    "carGoalEta": "2027-03",
    "emergencyFundFundedPct": 77
  }
};

