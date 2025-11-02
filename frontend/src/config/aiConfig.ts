// AI Configuration for VillageVault
export const AI_CONFIG = {
  // OpenRouter API Configuration
  API_KEY: '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',
  BASE_URL: 'https://openrouter.ai/api/v1',
  
  // Plan Configuration
  IS_PAID_PLAN: true, // Set to true for unlimited free usage
  
  // Free Plan Settings - Using Gemini Pro (1st priority)
  FREE_PLAN: {
    MODEL: 'gemini-pro-rapidapi', // Gemini Pro via RapidAPI (1st)
    RATE_LIMIT_DELAY: 3000, // 3 second delay to avoid rate limits
    MAX_REQUESTS_PER_MINUTE: 20, // Reduced to be more conservative
    DAILY_LIMIT: 100, // Reduced daily limit
  },
  
  // Paid Plan Settings (unlimited free usage)
  PAID_PLAN: {
    MODEL: 'gemini-pro-rapidapi', // Gemini Pro via RapidAPI (1st)
    RATE_LIMIT_DELAY: 0, // No delay for unlimited usage
    MAX_REQUESTS_PER_MINUTE: 1000, // Much higher limit
    DAILY_LIMIT: -1, // Unlimited
  },
  
  // RapidAPI Gemini Pro Configuration
  RAPIDAPI_GEMINI: {
    ENABLED: true,
    API_KEY: 'f46182d631msh53ac1ab80e43ca3p15d946jsn2a90685ffdc9',
    BASE_URL: 'https://gemini-pro-ai.p.rapidapi.com',
    MODEL: 'gemini-pro-rapidapi',
    HOST: 'gemini-pro-ai.p.rapidapi.com'
  },

  // Alternative Free Models (ordered by preference)
  ALTERNATIVE_FREE_MODELS: [
    'deepseek/deepseek-v3.1:free', // DeepSeek V3.1 - Fast everyday use (2nd)
    'z-ai/glm-4.5-air:free', // GLM 4.5 Air - Light, stable chat (3rd)
    'nvidia/nemotron-nano-9b-v2:free', // NVIDIA Nemotron - General reasoning
    'alibaba/tongyi-deepresearch-30b-a3b:free' // Tongyi DeepResearch - Deep research
  ]
}

// Usage Information
export const USAGE_INFO = {
  FREE_PLAN: {
    description: "Free tier with rate limits",
    cost: "$0/month",
    limitations: [
      "Rate limited (30 requests/minute)",
      "Daily usage limits",
      "Limited to free models only",
      "May experience 429 errors during high usage"
    ],
    benefits: [
      "Completely free",
      "Good for testing and small villages",
      "Fallback responses when rate limited"
    ]
  },
  
  PAID_PLAN: {
    description: "Pay-per-use with higher limits",
    cost: "~$0.001-0.01 per request (very cheap)",
    limitations: [
      "Requires payment method",
      "Pay for each API call"
    ],
    benefits: [
      "Much higher rate limits",
      "Access to premium models",
      "No daily limits",
      "Better reliability",
      "Unlimited usage"
    ]
  }
}

// How to upgrade to paid plan:
export const UPGRADE_INSTRUCTIONS = `
To upgrade to unlimited AI chat:

1. Go to OpenRouter.ai
2. Add payment method (credit card)
3. Set spending limit (e.g., $10/month)
4. Change IS_PAID_PLAN to true in this config
5. Optionally change model to premium version

Cost: Very cheap - typically $0.001-0.01 per chat message
For a village of 100 people: ~$5-10/month for unlimited AI assistance
`
