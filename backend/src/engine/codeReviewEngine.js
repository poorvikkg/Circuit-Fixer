// ============================================================
// Advanced Code Review Engine v2
// Deep static analysis for enterprise-grade code auditing
// ============================================================

const DESIGN_PATTERNS = {
  singleton:    { name: "Singleton", category: "Creational", icon: "🔒", description: "Ensure a class has only one instance. Use for DB connections, config managers, loggers." },
  factory:      { name: "Factory Method", category: "Creational", icon: "🏭", description: "Delegate object creation to subclasses. Use when you have multiple product types." },
  builder:      { name: "Builder", category: "Creational", icon: "🧱", description: "Construct complex objects step-by-step. Use for objects with many optional parameters." },
  repository:   { name: "Repository", category: "Structural", icon: "🗄️", description: "Centralize data access logic. Decouple domain from persistence layer." },
  strategy:     { name: "Strategy", category: "Behavioral", icon: "♟️", description: "Encapsulate interchangeable algorithms. Replace if/else chains with pluggable behaviors." },
  observer:     { name: "Observer / Event Emitter", category: "Behavioral", icon: "📡", description: "Decouple producers and consumers. Enable pub/sub for async workflows." },
  middleware:   { name: "Middleware Chain", category: "Behavioral", icon: "⛓️", description: "Chain handlers for cross-cutting concerns (auth, logging, rate limiting)." },
  cqrs:         { name: "CQRS", category: "Architectural", icon: "📊", description: "Separate read and write models. Optimize each independently for performance." },
  facade:       { name: "Facade", category: "Structural", icon: "🏛️", description: "Simplified interface to a complex subsystem. Reduce coupling between layers." },
  decorator:    { name: "Decorator", category: "Structural", icon: "🎨", description: "Attach responsibilities dynamically. Use for logging, caching, validation wrappers." },
  adapter:      { name: "Adapter", category: "Structural", icon: "🔌", description: "Convert interface of a class into another. Use for third-party API integration." },
  proxy:        { name: "Proxy", category: "Structural", icon: "🛡️", description: "Control access to an object. Use for lazy loading, access control, or caching." },
};

function detectIssues(files) {
  const issues = [];
  const patterns = [];
  const readability = [];
  const scalability = [];
  const security = [];
  const complexity = [];
  const dependencies = [];

  let totalLines = 0;
  let totalFunctions = 0;
  let totalClasses = 0;
  const allPaths = files.map(f => f.path);
  const importMap = {};  // file -> [imported modules]
  const exportMap = {};  // file -> [exported names]
  const fileMetrics = [];

  for (const file of files) {
    const { path: fp, content, language } = file;
    if (!content) continue;

    const lines = content.split("\n");
    totalLines += lines.length;

    // Per-file metrics
    const metric = {
      path: fp,
      lines: lines.length,
      functions: 0,
      classes: 0,
      imports: 0,
      exports: 0,
      todos: 0,
      complexityScore: 0,
      hasTests: fp.includes("test") || fp.includes("spec") || fp.includes("__tests__"),
      issues: []
    };

    // ── Count functions ──
    const fnMatches = content.match(/function\s+\w+|const\s+\w+\s*=\s*(?:async\s*)?\(/g) || [];
    metric.functions = fnMatches.length;
    totalFunctions += metric.functions;

    // ── Count classes ──
    const classMatches = content.match(/class\s+\w+/g) || [];
    metric.classes = classMatches.length;
    totalClasses += metric.classes;

    // ── Track imports ──
    const importMatches = content.match(/require\(["']([^"']+)["']\)|import\s+.*?from\s+["']([^"']+)["']/g) || [];
    metric.imports = importMatches.length;
    importMap[fp] = importMatches.map(m => {
      const match = m.match(/["']([^"']+)["']/);
      return match ? match[1] : "";
    }).filter(Boolean);

    // ── Track exports ──
    const exportMatches = content.match(/module\.exports|export\s+(default|const|function|class)/g) || [];
    metric.exports = exportMatches.length;

    // ── TODOs / FIXMEs ──
    const todoMatches = content.match(/\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/gi) || [];
    metric.todos = todoMatches.length;

    // ── Cyclomatic complexity estimate ──
    const ifCount = (content.match(/\bif\s*\(/g) || []).length;
    const elseCount = (content.match(/\belse\b/g) || []).length;
    const forCount = (content.match(/\bfor\s*\(/g) || []).length;
    const whileCount = (content.match(/\bwhile\s*\(/g) || []).length;
    const switchCount = (content.match(/\bcase\s+/g) || []).length;
    const ternaryCount = (content.match(/\?\s*[^:]+\s*:/g) || []).length;
    const catchCount = (content.match(/\bcatch\s*\(/g) || []).length;
    const andOrCount = (content.match(/&&|\|\|/g) || []).length;
    metric.complexityScore = ifCount + elseCount + forCount + whileCount + switchCount + ternaryCount + catchCount + andOrCount;

    // ── Deep Readability ──
    if (content.match(/\b(let|const|var)\s+[a-z]\s*=/i)) {
      if (!readability.find(r => r.title === "Use Descriptive Names")) {
        readability.push({ title: "Use Descriptive Names", file: "Multiple files", description: `Found single-letter variable assignments (e.g., in ${fp}). Replace abbreviations with intention-revealing names.`, before: "const d = await db.find(u);\nconst x = calc(d.a, d.b);", after: "const userProfile = await userRepo.findById(userId);\nconst totalRevenue = calculateRevenue(userProfile.orders, userProfile.discounts);" });
      }
    }

    if (content.match(/===?\s*\d{3,}/)) {
      if (!readability.find(r => r.title === "Extract Magic Numbers")) {
        readability.push({ title: "Extract Magic Numbers", file: "Multiple files", description: `Found hard-coded numbers (e.g., in ${fp}). Magic numbers lack context and make code brittle.`, before: "if (retries > 5) throw new Error('Failed');\nsetTimeout(fn, 3600000);", after: "const MAX_RETRIES = 5;\nconst ONE_HOUR_MS = 60 * 60 * 1000;\n\nif (retries > MAX_RETRIES) throw new Error('Failed');\nsetTimeout(fn, ONE_HOUR_MS);" });
      }
    }

    if (content.includes("if ") && content.split("if ").length > 5 && content.includes("    if ")) {
      if (!readability.find(r => r.title === "Guard Clauses (Early Return)")) {
        readability.push({ title: "Guard Clauses (Early Return)", file: fp, description: `Deeply nested if-statements detected in ${fp}. Replace with early returns to keep the happy path flat.`, before: "if (user) {\n  if (user.isActive) {\n    if (user.hasPermission) {\n      // actual logic buried here\n    }\n  }\n}", after: "if (!user) return res.status(404).json({ error: 'Not found' });\nif (!user.isActive) return res.status(403).json({ error: 'Inactive' });\nif (!user.hasPermission) return res.status(403).json({ error: 'Forbidden' });\n\n// actual logic here — clean and flat" });
      }
    }

    if ((content.includes("res.json({ err") || content.includes("res.json({ msg")) && !readability.find(r => r.title === "Consistent Error Responses")) {
      readability.push({ title: "Consistent Error Responses", file: fp, description: `Inconsistent API error formats found in ${fp}. Standardize your error envelope for API clients.`, before: "res.json({ msg: 'bad input' });\nres.json({ error: 'Not found' });\nres.json({ err: true, reason: 'Unauthorized' });", after: "throw new AppError(400, 'INVALID_INPUT', 'Email is required');\n// Global handler formats: { status: 'error', code, message }" });
    }

    // ── Deep Scalability ──
    if (content.includes("req.session") || content.includes("global.") || content.includes("window.localStorage")) {
      if (!scalability.find(s => s.area === "Stateless Architecture")) {
        scalability.push({ area: "Stateless Architecture", severity: "critical", issue: `Stateful data storage detected in ${fp}. This prevents horizontal scaling.`, fix: "Move all state to external stores: Redis for sessions/cache, PostgreSQL for persistent data. Every instance must be interchangeable.", impact: "Enables auto-scaling from 1 to 100+ instances behind a load balancer." });
      }
    }

    if (content.match(/\.map\(.*?=>.*?await/s) || content.match(/for\s*\(.*?\)\s*\{[\s\S]*?await\s+.*\./)) {
      if (!scalability.find(s => s.area === "N+1 Query Problem")) {
        scalability.push({ area: "N+1 Query Problem", severity: "high", issue: `Awaited calls inside loops detected in ${fp}. This creates O(N) network or DB round trips.`, fix: "Use eager loading (e.g. Prisma include, Promise.all), batch queries (WHERE id IN), or DataLoader.", impact: "Reduces latency and DB load exponentially at scale." });
      }
    }

    if ((content.match(/await\s+(send|generate|resize|upload|process)/i)) && (content.includes("res.status") || content.includes("res.json") || content.includes("res.send"))) {
      if (!scalability.find(s => s.area === "Async Job Processing")) {
        scalability.push({ area: "Async Job Processing", severity: "high", issue: `Heavy synchronous operations inside request handlers in ${fp}. This blocks the event loop and causes API timeouts.`, fix: "Offload to a background job queue (BullMQ + Redis, AWS SQS). Return 202 Accepted immediately.", impact: "Prevents request timeouts and keeps API p99 latency low." });
      }
    }

    // ── File-level issues ──
    if (lines.length > 400) metric.issues.push("oversized");
    if (metric.complexityScore > 50) metric.issues.push("high-complexity");
    if (metric.imports > 15) metric.issues.push("too-many-imports");
    if (metric.todos > 3) metric.issues.push("unresolved-todos");

    // ── Deep content analysis ──

    // No error handling
    const hasTryCatch = content.includes("try {") || content.includes("try{");
    const hasPromiseCatch = content.includes(".catch(");
    if (!hasTryCatch && !hasPromiseCatch && (content.includes("await ") || content.includes("fetch("))) {
      issues.push({ severity: "critical", area: "Reliability", title: "Missing Error Handling", description: `${fp} uses async operations without try/catch. Unhandled promise rejections crash Node.js.`, files: [fp], fix: "Wrap all async calls in try/catch. Add a global Express error-handling middleware." });
    }

    // Hardcoded secrets
    if ((content.includes("password") || content.includes("secret") || content.includes("apiKey") || content.includes("api_key")) && content.includes("=") && !content.includes("process.env") && !content.includes("config.") && !fp.endsWith(".env") && !fp.includes("test")) {
      security.push({ severity: "critical", area: "Secrets", title: "Hardcoded Credentials", description: `${fp} may contain hardcoded passwords or API keys.`, fix: "Move to environment variables. Use dotenv locally, secrets manager in production." });
    }

    // SQL injection risk
    if ((content.includes("SELECT ") || content.includes("INSERT ") || content.includes("DELETE ")) && (content.includes("${") || content.includes("' +"))) {
      security.push({ severity: "critical", area: "SQL Injection", title: "String-Interpolated SQL Queries", description: `${fp} builds SQL queries with string concatenation/interpolation — high SQL injection risk.`, fix: "Use parameterized queries ($1, ?) or an ORM (Prisma, Sequelize, Knex)." });
    }

    // XSS via innerHTML
    if (content.includes("innerHTML") && !content.includes("DOMPurify") && !content.includes("sanitize")) {
      security.push({ severity: "high", area: "XSS", title: "Unsafe innerHTML Usage", description: `${fp} uses innerHTML without sanitization — potential XSS attack vector.`, fix: "Use DOMPurify.sanitize() or React's JSX (which auto-escapes). Never set innerHTML with user input." });
    }

    // eval usage
    if (content.includes("eval(") || content.includes("new Function(")) {
      security.push({ severity: "critical", area: "Code Injection", title: "eval() or new Function() Detected", description: `${fp} uses eval() which can execute arbitrary code — severe security risk.`, fix: "Remove eval(). Use JSON.parse() for data, or a proper expression parser for dynamic logic." });
    }

    // No input validation
    if ((content.includes("req.body") || content.includes("req.params") || content.includes("req.query")) && !content.includes("validate") && !content.includes("Joi") && !content.includes("zod") && !content.includes("yup") && !content.includes("express-validator")) {
      security.push({ severity: "high", area: "Input Validation", title: "No Input Validation", description: `${fp} reads request data without validation. Malformed input can crash the app or exploit logic bugs.`, fix: "Use Joi, Zod, or express-validator to validate and sanitize all user inputs at the controller layer." });
    }

    // Callback hell
    const nestedCallbacks = (content.match(/\.then\(function/g) || []).length;
    if (nestedCallbacks > 3) {
      readability.push({ title: "Callback Hell Detected", file: fp, description: `${nestedCallbacks} nested .then(function...) chains found. Hard to read, debug, and maintain.`, before: "fetch(url)\n  .then(function(res) {\n    return res.json();\n  })\n  .then(function(data) {\n    // nested logic\n  });", after: "const res = await fetch(url);\nconst data = await res.json();\n// flat, readable logic" });
    }

    // God file
    if (lines.length > 500) {
      issues.push({ severity: "critical", area: "Architecture", title: "God File — Violating SRP", description: `${fp} is ${lines.length} lines. Files this large do too much and are impossible to unit-test effectively.`, files: [fp], fix: "Extract into focused modules. Each file should have one reason to change (Single Responsibility)." });
    }

    // Long functions
    const funcDecls = [...content.matchAll(/(?:function\s+(\w+)|(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))/g)];
    for (const match of funcDecls) {
      const fnName = match[1] || match[2] || "anonymous";
      const startIdx = match.index;
      let braceCount = 0; let started = false; let fnLength = 0;
      for (let ci = startIdx; ci < content.length && ci < startIdx + 5000; ci++) {
        if (content[ci] === "{") { braceCount++; started = true; }
        if (content[ci] === "}") braceCount--;
        if (content[ci] === "\n") fnLength++;
        if (started && braceCount === 0) break;
      }
      if (fnLength > 60) {
        issues.push({ severity: "medium", area: "Readability", title: `Function "${fnName}" is ${fnLength} lines`, description: `In ${fp}. Functions over 40 lines become hard to reason about and test.`, files: [fp], fix: `Break "${fnName}" into smaller, well-named helper functions. Each should do one thing.` });
      }
    }

    // console.log in production code
    const consoleLogs = (content.match(/console\.(log|warn|error|info)\(/g) || []).length;
    if (consoleLogs > 5 && !metric.hasTests) {
      issues.push({ severity: "medium", area: "Logging", title: `${consoleLogs} console statements in ${fp}`, description: "Excessive console.log in production code. No structured logging, no log levels, no centralized collection.", files: [fp], fix: "Replace with a structured logger (Winston, Pino). Use log levels (info, warn, error). Remove debug logs before production." });
    }

    fileMetrics.push(metric);
  }

  // ── Cross-file dependency analysis ──
  const circularDeps = [];
  for (const [fileA, importsA] of Object.entries(importMap)) {
    for (const imp of importsA) {
      if (imp.startsWith(".")) {
        const resolved = allPaths.find(p => p.includes(imp.replace(/^\.\//, "").replace(/\.\w+$/, "")));
        if (resolved && importMap[resolved]) {
          const reverseImps = importMap[resolved];
          if (reverseImps.some(ri => ri.startsWith(".") && fileA.includes(ri.replace(/^\.\//, "").replace(/\.\w+$/, "")))) {
            circularDeps.push({ fileA, fileB: resolved });
          }
        }
      }
    }
  }

  if (circularDeps.length > 0) {
    issues.push({ severity: "high", area: "Architecture", title: `${circularDeps.length} Circular Dependencies Detected`, description: "Circular imports create tight coupling, make testing difficult, and can cause runtime bugs with undefined imports.", files: circularDeps.slice(0, 3).map(d => `${d.fileA} ↔ ${d.fileB}`), fix: "Break cycles by extracting shared logic into a new module. Use dependency injection or event-based communication." });
  }

  // ── Coupling analysis ──
  const avgImports = fileMetrics.reduce((a, m) => a + m.imports, 0) / Math.max(fileMetrics.length, 1);
  const highlyCoupled = fileMetrics.filter(m => m.imports > avgImports * 2 && m.imports > 8);
  if (highlyCoupled.length > 0) {
    issues.push({ severity: "high", area: "Coupling", title: `${highlyCoupled.length} Highly-Coupled Modules`, description: `These files import far more dependencies than average (${avgImports.toFixed(0)} avg). High coupling = hard to change, hard to test.`, files: highlyCoupled.slice(0, 5).map(m => `${m.path} (${m.imports} imports)`), fix: "Apply Facade pattern to reduce direct dependencies. Use dependency injection. Consider an event bus for cross-module communication." });
  }

  // ── Test coverage hint ──
  const testFiles = fileMetrics.filter(m => m.hasTests);
  const srcFiles = fileMetrics.filter(m => !m.hasTests);
  if (testFiles.length === 0 && srcFiles.length > 3) {
    issues.push({ severity: "high", area: "Testing", title: "No Test Files Found", description: `${srcFiles.length} source files but 0 test files. No safety net for refactoring or catching regressions.`, files: [], fix: "Add unit tests using Jest or Vitest. Start with the most critical business-logic modules. Aim for 80%+ coverage on core services." });
  } else if (testFiles.length > 0 && testFiles.length < srcFiles.length * 0.3) {
    issues.push({ severity: "medium", area: "Testing", title: "Low Test Coverage", description: `Only ${testFiles.length} test files for ${srcFiles.length} source files (~${((testFiles.length / srcFiles.length) * 100).toFixed(0)}% ratio).`, files: [], fix: "Prioritize tests for controllers, services, and data access layers. Use mocks for external dependencies." });
  }

  // ── Design Pattern Suggestions ──
  const hasControllers = allPaths.some(f => f.toLowerCase().includes("controller"));
  const hasServices = allPaths.some(f => f.toLowerCase().includes("service"));
  const hasModels = allPaths.some(f => f.toLowerCase().includes("model"));
  const hasRepos = allPaths.some(f => f.toLowerCase().includes("repository") || f.toLowerCase().includes("repo"));
  const hasRoutes = allPaths.some(f => f.toLowerCase().includes("route"));
  const hasEvents = allPaths.some(f => f.toLowerCase().includes("event") || f.toLowerCase().includes("listener"));
  const hasMiddleware = allPaths.some(f => f.toLowerCase().includes("middleware"));
  const hasConfig = allPaths.some(f => f.toLowerCase().includes("config"));
  const hasUtils = allPaths.some(f => f.toLowerCase().includes("util") || f.toLowerCase().includes("helper"));

  if (!hasRepos) {
    patterns.push({ pattern: DESIGN_PATTERNS.repository, priority: "high", reason: "No repository layer found. DB queries are scattered across services/controllers, making it impossible to swap data sources or mock for testing.", example: "class UserRepository {\n  constructor(db) { this.db = db; }\n\n  async findById(id) {\n    return this.db.query('SELECT * FROM users WHERE id = $1', [id]);\n  }\n\n  async save(user) {\n    return this.db.query(\n      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',\n      [user.name, user.email]\n    );\n  }\n}" });
  }

  if (!hasServices && hasControllers) {
    patterns.push({ pattern: DESIGN_PATTERNS.facade, priority: "critical", reason: "Controllers contain business logic directly. This violates separation of concerns and makes the code untestable without spinning up an HTTP server.", example: "// services/OrderService.js\nclass OrderService {\n  constructor(orderRepo, paymentGateway, notifier) {\n    this.orderRepo = orderRepo;\n    this.payment = paymentGateway;\n    this.notifier = notifier;\n  }\n\n  async placeOrder(userId, items) {\n    const order = await this.orderRepo.create(userId, items);\n    await this.payment.charge(order.total);\n    await this.notifier.send(userId, 'Order placed!');\n    return order;\n  }\n}" });
  }

  if (!hasEvents) {
    patterns.push({ pattern: DESIGN_PATTERNS.observer, priority: "high", reason: "No event-driven layer. Services are tightly coupled via direct function calls. Adding a new consumer (e.g., analytics) requires modifying existing code.", example: "// events/EventBus.js\nconst EventEmitter = require('events');\nconst bus = new EventEmitter();\n\n// Producer (in OrderService):\nbus.emit('order.created', { orderId, userId });\n\n// Consumer (in NotificationService):\nbus.on('order.created', async ({ userId }) => {\n  await sendPushNotification(userId, 'Your order is confirmed!');\n});\n\n// Consumer (in AnalyticsService):\nbus.on('order.created', async ({ orderId }) => {\n  await trackEvent('purchase', { orderId });\n});" });
  }

  if (!hasMiddleware && hasRoutes) {
    patterns.push({ pattern: DESIGN_PATTERNS.middleware, priority: "medium", reason: "No dedicated middleware layer. Cross-cutting concerns (auth, logging, rate-limiting) are likely duplicated across routes.", example: "// middleware/authenticate.js\nmodule.exports = (req, res, next) => {\n  const token = req.headers.authorization?.split(' ')[1];\n  if (!token) return res.status(401).json({ error: 'No token' });\n\n  try {\n    req.user = jwt.verify(token, process.env.JWT_SECRET);\n    next();\n  } catch (e) {\n    return res.status(401).json({ error: 'Invalid token' });\n  }\n};\n\n// Usage:\nrouter.get('/orders', authenticate, authorize('admin'), getOrders);" });
  }

  // Always suggest these
  patterns.push({ pattern: DESIGN_PATTERNS.strategy, priority: "medium", reason: "Replace long if/else or switch chains with pluggable strategy objects. Makes adding new behaviors trivial without modifying existing code (Open/Closed Principle).", example: "// strategies/payment.js\nconst strategies = {\n  credit: { charge: (amt) => creditCardAPI.charge(amt) },\n  paypal: { charge: (amt) => paypalAPI.charge(amt) },\n  crypto: { charge: (amt) => cryptoAPI.charge(amt) },\n};\n\n// Usage:\nconst strategy = strategies[paymentMethod];\nawait strategy.charge(amount);" });

  patterns.push({ pattern: DESIGN_PATTERNS.builder, priority: "low", reason: "If you have objects with many optional parameters (query builders, config objects, email templates), the Builder pattern prevents massive constructor signatures.", example: "class QueryBuilder {\n  constructor() { this.query = {}; }\n  where(field, value) { this.query[field] = value; return this; }\n  limit(n) { this.query._limit = n; return this; }\n  sort(field) { this.query._sort = field; return this; }\n  build() { return this.query; }\n}\n\nconst q = new QueryBuilder().where('status','active').limit(10).sort('created_at').build();" });

  patterns.push({ pattern: DESIGN_PATTERNS.decorator, priority: "low", reason: "Wrap existing functions with additional behavior (caching, logging, retry) without modifying the original implementation.", example: "// decorators/withCache.js\nfunction withCache(fn, ttl = 60) {\n  const cache = new Map();\n  return async function(...args) {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    const result = await fn.apply(this, args);\n    cache.set(key, result);\n    setTimeout(() => cache.delete(key), ttl * 1000);\n    return result;\n  };\n}\n\nconst cachedGetUser = withCache(userRepo.findById, 120);" });

  // ── Global Scalability Checks ──
  const hasRedis = Object.values(importMap).flat().some(i => i.includes("redis") || i.includes("ioredis") || i.includes("memcached"));
  const hasRateLimit = Object.values(importMap).flat().some(i => i.includes("rate-limit") || i.includes("ratelimit") || i.includes("throttl"));
  const hasDbPool = Object.values(importMap).flat().some(i => i.includes("pg") || i.includes("mysql") || i.includes("sequelize") || i.includes("prisma") || i.includes("mongoose") || i.includes("typeorm"));

  if (!hasRedis && hasDbPool && !scalability.find(s => s.area === "Caching Strategy")) {
    scalability.push({ area: "Caching Strategy", severity: "high", issue: "Database detected but no caching layer (Redis/Memcached) found. DB will become a bottleneck under heavy read load.", fix: "Implement Cache-Aside with Redis. Cache hot reads (user profiles, feed) with TTL. Invalidate on writes.", impact: "Reduces DB load by 80-90% for read-heavy workloads." });
  }

  if (!hasRateLimit && hasRoutes && !scalability.find(s => s.area === "Rate Limiting")) {
    scalability.push({ area: "Rate Limiting", severity: "medium", issue: "API routes detected but no rate limiting middleware found. Vulnerable to DDoS and resource exhaustion.", fix: "Add rate limiting at the API Gateway or Express level (express-rate-limit).", impact: "Protects backend services from abusive traffic." });
  }

  // Ensure there's at least one scalability tip if the code is simple
  if (scalability.length === 0) {
    scalability.push({ area: "Horizontal Scalability", severity: "info", issue: "The codebase looks clean, but ensure it is deployed redundantly.", fix: "Deploy minimum 2-3 instances behind a Load Balancer. Ensure your DB is separate from your web instances.", impact: "Prevents Single Point of Failure (SPOF)." });
  }

  // ── Complexity scoreboard ──
  const complexFiles = fileMetrics
    .filter(m => !m.hasTests)
    .sort((a, b) => b.complexityScore - a.complexityScore)
    .slice(0, 10);

  const overallHealth = calculateHealthScore(issues, security, fileMetrics);

  // ── Generate Repository Architecture Map (Mermaid) ──
  let mermaidGraph = "flowchart TD\n";
  const addedNodes = new Set();
  const edges = new Map(); // edgeId -> {from, to}
  const groups = {}; // dir -> [nodes]
  
  for (const [file, imports] of Object.entries(importMap)) {
    const parts = file.split('/');
    const dir = parts.length > 1 ? parts[parts.length - 2] : "root";
    const name = file.split('/').pop().replace(/[^a-zA-Z0-9]/g, '_');
    const display = file.split('/').pop();
    
    if (!addedNodes.has(name)) {
      if (!groups[dir]) groups[dir] = [];
      groups[dir].push({ name, display });
      addedNodes.add(name);
    }
    
    for (const imp of imports) {
      if (imp.startsWith(".")) {
         const resolved = allPaths.find(p => p.includes(imp.replace(/^\.\//, "").replace(/\.\w+$/, "")));
         if (resolved) {
           const toName = resolved.split('/').pop().replace(/[^a-zA-Z0-9]/g, '_');
           const toParts = resolved.split('/');
           const toDir = toParts.length > 1 ? toParts[toParts.length - 2] : "root";
           
           if (!addedNodes.has(toName)) {
             if (!groups[toDir]) groups[toDir] = [];
             groups[toDir].push({ name: toName, display: resolved.split('/').pop() });
             addedNodes.add(toName);
           }
           
           const edgeId = `${name}-${toName}`;
           if (!edges.has(edgeId)) {
             edges.set(edgeId, { from: name, to: toName });
           }
         }
      }
    }
  }

  // Add subgraphs in a specific order for better hierarchy
  const orderedDirs = ["routes", "controllers", "services", "models", "data", "config", "utils", "root"];
  const existingDirs = Object.keys(groups).sort((a,b) => {
    const ai = orderedDirs.indexOf(a.toLowerCase());
    const bi = orderedDirs.indexOf(b.toLowerCase());
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  for (const dir of existingDirs) {
    const nodes = groups[dir];
    mermaidGraph += `  subgraph ${dir.toUpperCase()}\n`;
    for (const node of nodes) {
      mermaidGraph += `    ${node.name}["📄 ${node.display}"]\n`;
    }
    mermaidGraph += `  end\n`;
  }

  // Add edges
  for (const edge of edges.values()) {
    mermaidGraph += `  ${edge.from} --> ${edge.to}\n`;
  }

  // FORCE HIERARCHY: Add invisible edges between groups to force them into rows
  for (let i = 0; i < existingDirs.length - 1; i++) {
    const fromDir = existingDirs[i];
    const toDir = existingDirs[i+1];
    const fromNode = groups[fromDir][0]?.name;
    const toNode = groups[toDir][0]?.name;
    if (fromNode && toNode) {
      mermaidGraph += `  ${fromNode} ~~~ ${toNode}\n`; // Invisible edge to force rank
    }
  }
  
  // Style the graph
  mermaidGraph += "  classDef default fill:#1f2937,stroke:#4b5563,stroke-width:1px,color:#f9fafb,rx:8,ry:8;\n";
  
  if (mermaidGraph === "flowchart TD\n  classDef default fill:#1f2937,stroke:#4b5563,stroke-width:1px,color:#f9fafb,rx:8,ry:8;\n") {
    mermaidGraph = null;
  }

  // ── Generate React Flow Compatible Dependency Data ──
  const reactFlowNodes = [];
  const reactFlowEdges = [];
  
  for (const [dir, nodes] of Object.entries(groups)) {
    for (const node of nodes) {
      reactFlowNodes.push({
        id: node.name,
        label: node.display,
        layer: dir.toLowerCase(),
      });
    }
  }

  for (const edge of edges.values()) {
    reactFlowEdges.push([edge.from, edge.to]);
  }

  return {
    summary: {
      totalFiles: files.length,
      totalLines,
      totalFunctions,
      totalClasses,
      testFiles: fileMetrics.filter(m => m.hasTests).length,
      issueCount: issues.length,
      securityCount: security.length,
      criticalCount: issues.filter(i => i.severity === "critical").length + security.filter(s => s.severity === "critical").length,
      highCount: issues.filter(i => i.severity === "high").length + security.filter(s => s.severity === "high").length,
      healthScore: overallHealth
    },
    issues,
    security,
    patterns,
    scalability,
    readability,
    complexity: complexFiles,
    fileMetrics,
    mermaidGraph,
    dependencyData: {
      nodes: reactFlowNodes,
      edges: reactFlowEdges
    }
  };
}

function calculateHealthScore(issues, security, metrics) {
  let score = 100;
  for (const i of issues) {
    if (i.severity === "critical") score -= 15;
    else if (i.severity === "high") score -= 8;
    else if (i.severity === "medium") score -= 3;
  }
  for (const s of security) {
    if (s.severity === "critical") score -= 20;
    else if (s.severity === "high") score -= 10;
  }
  const hasTests = metrics.some(m => m.hasTests);
  if (!hasTests) score -= 10;
  return Math.max(0, Math.min(100, score));
}

module.exports = { detectIssues };
