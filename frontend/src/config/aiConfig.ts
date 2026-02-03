// AI Configuration for VillageVault
export const AI_CONFIG = {
  // OpenRouter API Configuration
  API_KEY: import.meta.env.VITE_OPENROUTER_API_KEY,
  BASE_URL: 'https://openrouter.ai/api/v1',

  // Plan Configuration
  IS_PAID_PLAN: true,

  // Free Plan Settings
  FREE_PLAN: {
    MODEL: 'z-ai/glm-4.5-air:free', // Default to GLM 4.5 Air
    RATE_LIMIT_DELAY: 2000,
    MAX_REQUESTS_PER_MINUTE: 60,
    DAILY_LIMIT: 1000,
  },

  // Paid Plan Settings
  PAID_PLAN: {
    MODEL: 'openai/gpt-4o-mini', // Suggested: Safe, capable, and very cost-effective
    RATE_LIMIT_DELAY: 0,
    MAX_REQUESTS_PER_MINUTE: 1000,
    DAILY_LIMIT: -1,
  },

  // Direct OpenAI Configuration (Enabled)
  OPENAI_DIRECT: {
    ENABLED: true,
    API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
    BASE_URL: 'https://api.openai.com/v1',
    MODEL: 'gpt-4o-mini'
  },

  // Direct Google Gemini API Configuration (Enabled)
  GEMINI_DIRECT: {
    ENABLED: true,
    API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
    BASE_URL: 'https://generativelanguage.googleapis.com/v1',
    MODEL: 'gemini-pro-direct'
  },

  // Alternative Free Models (ordered by preference)
  ALTERNATIVE_FREE_MODELS: [
    'z-ai/glm-4.5-air:free',
    'alibaba/tongyi-deepresearch-30b-a3b:free', // Alibaba
    'nvidia/nemotron-nano-9b-v2:free', // Nvidia
    'google/gemini-pro-1.5' // Fallback
  ]
}

// Usage Information
export const USAGE_INFO = {
  FREE_PLAN: {
    description: "Free tier",
    cost: "$0/month",
    limitations: ["Rate limited", "Daily usage limits"],
    benefits: ["Completely free", "Good for testing"]
  },

  PAID_PLAN: {
    description: "Pay-per-use",
    cost: "Very cheap",
    limitations: ["Requires payment method"],
    benefits: ["Higher rate limits", "Unlimited usage"]
  }
}

export const UPGRADE_INSTRUCTIONS = `To upgrade, visit OpenRouter.ai`
