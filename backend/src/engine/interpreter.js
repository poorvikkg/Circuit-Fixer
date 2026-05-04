const STARTUP_USER_THRESHOLD = 10000;
const ENTERPRISE_USER_THRESHOLD = 1000000;

function interpret(input) {
  const flags = {
    // scale
    isSmallScale: input.users < STARTUP_USER_THRESHOLD,
    isMediumScale: input.users >= STARTUP_USER_THRESHOLD && input.users < ENTERPRISE_USER_THRESHOLD,
    isLargeScale: input.users >= ENTERPRISE_USER_THRESHOLD,

    // domain
    appType: input.appType,  // 'social', 'fintech', 'healthcare', 'ecommerce', 'gaming', 'saas', 'streaming'

    // features
    needsChat: input.features.includes("chat"),
    needsMedia: input.features.includes("media"),
    needsFeed: input.features.includes("feed"),
    needsNotifications: input.features.includes("notifications"),
    needsSearch: input.features.includes("search"),
    needsPayments: input.features.includes("payments"),
    needsAnalytics: input.features.includes("analytics"),

    // system behavior
    needsRealtime: input.realTime === true,
    isReadHeavy: input.readWriteRatio === "read-heavy",
    isWriteHeavy: input.readWriteRatio === "write-heavy",

    // deployment
    isGlobal: input.region === "global",
    isHighlyAvailable: input.availability === "high",

    // type-based flags
    isSocialApp: input.appType === "social",
    isEcommerce: input.appType === "ecommerce",
    isStreamingApp: input.appType === "streaming",
    isFintech: input.appType === "fintech",
    isHealthcare: input.appType === "healthcare",
    isGaming: input.appType === "gaming",
    isSaas: input.appType === "saas",

    // advanced config
    provider: input.cloudProvider,
    requiresCompliance: input.compliance !== "none",
    complianceType: input.compliance,
    isHipaa: input.compliance === "hipaa",
    isPci: input.compliance === "pci",
    isGdpr: input.compliance === "gdpr",
    isSoc2: input.compliance === "soc2",
    isStrongConsistency: input.consistency === "strong",
    requiresLowLatency: input.latency === "low",
    isLowBudget: input.budget === "low",

    // FAANG level flags
    isActiveActive: input.drStrategy === "active-active",
    needsDistributedTracing: input.observability === "distributed",
    needsChaosEngineering: input.resiliency === "chaos",
    needsCircuitBreaker: input.resiliency === "circuit-breaker" || input.resiliency === "chaos",
    useGrpc: input.apiProtocol === "grpc",
    useGraphql: input.apiProtocol === "graphql",
    isEventSourced: input.dataArchitecture === "event-sourcing",
    isCqrs: input.dataArchitecture === "cqrs" || input.dataArchitecture === "event-sourcing"
  };

  return flags;
}

module.exports = { interpret };