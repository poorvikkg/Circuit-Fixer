function interpret(input) {
  const flags = {
    // scale
    isSmallScale: input.users < 10000,
    isMediumScale: input.users >= 10000 && input.users < 1000000,
    isLargeScale: input.users >= 1000000,

    // features
    needsChat: input.features.includes("chat"),
    needsMedia: input.features.includes("media"),
    needsFeed: input.features.includes("feed"),
    needsNotifications: input.features.includes("notifications"),

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
    isStreamingApp: input.appType === "streaming"
  };

  return flags;
}

module.exports = { interpret };