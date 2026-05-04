// ===============================
// Service Expansion — LLD Generator v2 (FAANG-aware)
// ===============================

// ─────────────────────────────────────────────────────
// Domain-aware pattern injector — returns extra patterns
// specific to app type, compliance, scale, and protocol
// ─────────────────────────────────────────────────────
function getAppTypePatterns(serviceName, featureFlags) {
  const extras = [];
  const domain = featureFlags.appType || 'social';

  // ── Auth service domain overlays ──
  if (serviceName === 'auth_service') {
    if (featureFlags.isFintech || featureFlags.isPci)    extras.push('Zero Trust Architecture — no implicit trust between services', 'PCI-DSS Token Vault — card data replaced with payment tokens', 'Step-Up Auth — re-authenticate for high-value transactions');
    if (featureFlags.isHealthcare || featureFlags.isHipaa) extras.push('HIPAA BAA-compliant Session Management', 'SAML 2.0 / SCIM for enterprise hospital SSO', 'PHI Access Audit Log (required by HIPAA §164.312)');
    if (featureFlags.isGdpr)                  extras.push('Right-to-be-Forgotten — token + session purge on account delete', 'Consent Record Pattern — store legal basis for each data processing');
    if (featureFlags.isSocialApp)             extras.push('Social OAuth Delegation — Login with Google/Facebook/Apple');
    if (featureFlags.isGaming)                extras.push('Guest Account Pattern — anonymous session upgradeable to registered', 'Anti-Cheat Token Binding — device fingerprint embedded in JWT');
    if (featureFlags.isSaas)                  extras.push('Multi-Tenant JWT Claims — org_id + role scoped per tenant', 'API Key Pattern — machine-to-machine service authentication');
    if (featureFlags.useGrpc)                 extras.push('mTLS between services — gRPC Interceptor for certificate validation');
    if (featureFlags.isLargeScale)            extras.push('Distributed Session Store — Redis Cluster, not single node');
  }

  // ── Feed service domain overlays ──
  if (serviceName === 'feed_service') {
    if (featureFlags.isEcommerce)             extras.push('Personalization Engine — ML model ranks products by user purchase history', 'Collaborative Filtering — "Users who bought X also bought Y"', 'Price-Aware Sorting — boost discounted items via weighted score');
    if (featureFlags.isSocialApp)             extras.push('EdgeRank Algorithm — Facebook-style engagement-weighted feed', 'Celebrity Problem Solution — pull-on-read for accounts >10K followers');
    if (featureFlags.isGaming)                extras.push('Leaderboard Pattern — Redis Sorted Set (ZADD/ZRANK) for real-time rankings', 'Activity Feed — broadcast game events to friends in real time');
    if (featureFlags.isFintech)               extras.push('Audit Feed Pattern — immutable, append-only transaction history', 'Temporal Pattern — point-in-time balance reconstruction from events');
    if (featureFlags.isHealthcare)            extras.push('Care Timeline — chronological patient event feed with PHI masking');
    if (featureFlags.isCqrs)                  extras.push('Event Sourcing — PostPublished/PostLiked events as source of truth');
    if (featureFlags.isLargeScale)            extras.push('Sharded Fan-out — partition fan-out workers by user_id hash range');
    if (featureFlags.needsAnalytics)          extras.push('Lambda Architecture — batch (Spark) + speed (Kafka Streams) for feed analytics');
  }

  // ── Chat service domain overlays ──
  if (serviceName === 'chat_service') {
    if (featureFlags.isHealthcare)            extras.push('HIPAA-Secure Messaging — end-to-end encryption (Signal Protocol)', 'Message Retention Policy — PHI auto-purge after 7 years', 'Consent-Gated Chat — patient must consent before provider can message');
    if (featureFlags.isFintech)               extras.push('Encrypted Audit Chat — all messages archived for regulatory review', 'Advisory Chat Pattern — advisor ↔ client session with full audit trail');
    if (featureFlags.isGaming)                extras.push('Matchmaking Channel — ephemeral game lobby chat (auto-destroyed on game end)', 'Proximity Chat — spatial audio/text based on in-game coordinates');
    if (featureFlags.isSaas)                  extras.push('Workspace Messaging Pattern — org-scoped channels (like Slack)', 'Thread Pattern — hierarchical reply chains within channels');
    if (featureFlags.isSocialApp)             extras.push('Read Receipts Pattern — 1:1 delivery + read timestamp tracking', 'Group Chat Fan-out — Redis broadcast to all room members');
    if (featureFlags.isLargeScale)            extras.push('Horizontal Scaling Pattern — sticky sessions via consistent hash of room_id to pod');
    if (featureFlags.needsRealtime)           extras.push('WebRTC Signaling Pattern — chat service as signaling server for P2P voice/video');
  }

  // ── Media service domain overlays ──
  if (serviceName === 'media_service') {
    if (featureFlags.isHealthcare || featureFlags.isHipaa) extras.push('DICOM Storage Pattern — medical imaging stored in HIPAA-compliant S3 with KMS', 'PHI Redaction Pipeline — ML-based auto-redact patient identifiers in images');
    if (featureFlags.isEcommerce)             extras.push('Product Image CDN Pattern — multi-variant (zoom, thumbnail, mobile) per SKU', 'Virtual Try-On Hook — AR model inference on uploaded product images');
    if (featureFlags.isSocialApp)             extras.push('Stories Pattern — 24h TTL media with lifecycle rule to auto-delete', 'Short Video Transcoding — adaptive bitrate HLS segments (like TikTok)');
    if (featureFlags.isFintech)               extras.push('KYC Document Pattern — encrypted document upload with access-controlled pre-signed URLs', 'Document Retention Policy — immutable storage for compliance (WORM buckets)');
    if (featureFlags.isGaming)                extras.push('Game Asset CDN — binary asset versioning with blue/green CDN deploy', 'Screenshot Capture Pattern — server-side render capture for game replays');
    if (featureFlags.isPci || featureFlags.isFintech)    extras.push('SSE-KMS Encryption — customer-managed keys, never stored in plaintext');
  }

  // ── Notification service domain overlays ──
  if (serviceName === 'notification_service') {
    if (featureFlags.isEcommerce)             extras.push('Cart Abandonment Pattern — delayed trigger (30min) if no checkout event', 'Price Drop Alert — subscriber pattern for watched product price changes', 'Order Lifecycle Notifications — shipped/delivered Kafka event chain');
    if (featureFlags.isFintech)               extras.push('Transaction Alert Pattern — real-time push on any debit/credit event', 'Fraud Alert — high-priority push bypasses DND and frequency caps', 'Regulatory Notice Pattern — mandatory delivery acknowledgement (audit log)');
    if (featureFlags.isHealthcare)            extras.push('Appointment Reminder — HIPAA-compliant SMS/email with no PHI in payload', 'Critical Lab Result Alert — escalation chain until acknowledged');
    if (featureFlags.isGaming)                extras.push('Friend Activity Alert — "X just went online / achieved X" social triggers', 'Live Event Notification — broadcast push to all subscribed players');
    if (featureFlags.isSaas)                  extras.push('Webhook Delivery Pattern — send events to customer endpoints with retry + HMAC signature', 'Digest Notification — daily/weekly batch rollup email');
  }

  // ── User service domain overlays ──
  if (serviceName === 'user_service') {
    if (featureFlags.isEcommerce)             extras.push('Customer Segmentation Pattern — tag users by CLV, cohort, purchase behavior', 'Wishlist Pattern — lightweight user ↔ product relationship store');
    if (featureFlags.isHealthcare)            extras.push('Patient-Provider Relationship Pattern — regulated linkage with consent record', 'PHI Masking Pattern — PII fields encrypted at-rest, decrypted only on authorized access');
    if (featureFlags.isFintech)               extras.push('KYC Status Pattern — multi-step identity verification state machine', 'Account Tier Pattern — BASIC → VERIFIED → PREMIUM with gated feature access');
    if (featureFlags.isSaas)                  extras.push('Multi-Tenancy Pattern — all queries scoped by org_id (row-level security)', 'Invitation Pattern — workspace invite flow with time-limited token');
    if (featureFlags.isGaming)                extras.push('Player Profile Pattern — XP, level, achievements as first-class entities', 'Squad/Clan Pattern — hierarchical group membership with roles');
    if (featureFlags.isLargeScale)            extras.push('Read Replica Fan-out — user reads served from replica, writes to primary');
  }

  // ── Cross-cutting: compliance ──
  if (featureFlags.requiresCompliance && !featureFlags.isFintech && !featureFlags.isHealthcare) {
    extras.push(`${(featureFlags.complianceType || '').toUpperCase()} Compliance Pattern — audit log, data retention, and access controls enforced`);
  }

  // ── Cross-cutting: scale ──
  if (featureFlags.isLargeScale && extras.length === 0) {
    extras.push('Bulkhead Pattern — isolate critical service pools to prevent cascading failure', 'Backpressure Pattern — reject excess load gracefully under peak traffic');
  }

  return extras;
}

const getScaffoldForService = (serviceName, flags) => {
  let result = { codeScaffold: "", classDiagram: "", designPatterns: [] };

  if (serviceName === "chat_service") {
    result.codeScaffold = `// chatService.js
const { Server } = require('socket.io');
const Redis = require('ioredis');
const io = new Server(8080, { cors: { origin: '*' } });
const pubClient = new Redis(process.env.REDIS_URL);
const subClient = pubClient.duplicate();

subClient.subscribe('global_chat_events');
subClient.on('message', (channel, message) => {
  const data = JSON.parse(message);
  io.to(data.roomId).emit('new_message', data.payload);
});

io.on('connection', (socket) => {
  socket.on('send_message', async (data) => {
    const payload = { roomId: data.roomId, payload: data };
    await pubClient.publish('global_chat_events', JSON.stringify(payload));
  });
});`;
    result.designPatterns = ["Pub/Sub Pattern", "Observer Pattern", "Singleton (Redis Client)", "Adapter (WebSocket Interface)"];
    result.classDiagram = `classDiagram
    class ChatController {
      -WebSocketManager wsManager
      -PubSubEngine pubSub
      +initializeRoutes() void
      +handleDisconnect(userId: String) void
    }
    class WebSocketManager {
      -Map~String, Socket~ activeConnections
      +authenticate(token: String) Boolean
      +joinRoom(userId: String, roomId: String) void
      +sendMessage(roomId: String, msg: Message) void
    }
    class PubSubEngine {
      -Redis pubClient
      -Redis subClient
      +publish(channel: String, payload: Object) void
      +subscribe(channel: String, callback: Function) void
    }
    class Message {
      +String id
      +String senderId
      +String roomId
      +String content
      +Date timestamp
      +MessageStatus status
      +save() Promise~Boolean~
    }
    class MessageStatus {
      <<enumeration>>
      SENT
      DELIVERED
      READ
    }
    ChatController *-- WebSocketManager
    ChatController *-- PubSubEngine
    WebSocketManager --> Message : handles
    Message --> MessageStatus : uses`;
    return result;
  }
  
  if (serviceName === "feed_service") {
    result.codeScaffold = `// feedService.js
const Redis = require('ioredis');
const db = require('./database');
const redis = new Redis();

class FeedService {
  async publishPost(userId, content) {
    const post = await db.query('INSERT INTO posts...', [userId, content]);
    const followerCount = await db.query('SELECT count FROM user_stats...');
    
    if (followerCount < 50000) {
      // PUSH MODEL: Fan-out on write
      const followers = await db.query('SELECT follower_id FROM follows...');
      const pipeline = redis.pipeline();
      followers.forEach(f => {
        pipeline.lpush(\`user_feed:\${f.id}\`, post.id);
        pipeline.ltrim(\`user_feed:\${f.id}\`, 0, 499); 
      });
      await pipeline.exec();
    }
  }
}`;
    result.designPatterns = ["CQRS (Command Query Responsibility Segregation)", "Strategy Pattern (Fan-out Pull vs Push)", "Cache-Aside"];
    result.classDiagram = `classDiagram
    class FeedService {
      -PostRepository postRepo
      -RedisCache cache
      -FanOutStrategy fanOut
      +publishPost(post: Post) void
      +getUserFeed(userId: String, cursor: Int) List~Post~
    }
    class FanOutStrategy {
      <<interface>>
      +execute(post: Post, followers: List~String~) void
    }
    class PushFanOut {
      -RedisPipeline pipeline
      +execute(post: Post, followers: List~String~) void
    }
    class PullFanOut {
      -QueryBuilder qb
      +execute(post: Post, followers: List~String~) void
    }
    class Post {
      +String id
      +String authorId
      +String content
      +int likeCount
      +Date createdAt
    }
    class UserContext {
      +String userId
      +int followerCount
      +Boolean isCelebrity()
    }
    FeedService *-- FanOutStrategy
    FeedService --> Post : manages
    FanOutStrategy <|.. PushFanOut
    FanOutStrategy <|.. PullFanOut
    PushFanOut --> UserContext : evaluates`;
    return result;
  }

  if (serviceName === "media_service") {
    result.codeScaffold = `// mediaService.js
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

app.get('/upload-url', async (req, res) => {
  const key = \`uploads/\${Date.now()}_\${req.query.filename}\`;
  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket: process.env.AWS_BUCKET,
    Key: key,
    Expires: 300
  });
  res.json({ uploadUrl, key });
});`;
    result.designPatterns = ["Factory Pattern (Pre-signed URLs)", "Proxy Pattern (CDN handling)", "Async Worker Pattern"];
    result.classDiagram = `classDiagram
    class MediaController {
      -StorageProvider storage
      -JobQueue queue
      +generateUploadUrl(fileMeta: FileMetadata) String
      +handleUploadWebhook(event: WebhookEvent) void
    }
    class StorageProvider {
      <<interface>>
      +getSignedUrl(bucket: String, key: String) String
      +deleteObject(key: String) Boolean
    }
    class S3StorageProvider {
      -AWS.S3 s3Client
      +getSignedUrl(bucket: String, key: String) String
    }
    class JobQueue {
      +enqueueJob(topic: String, payload: Object) void
    }
    class FileMetadata {
      +String filename
      +String mimeType
      +Int sizeBytes
      +validate() Boolean
    }
    MediaController *-- StorageProvider
    MediaController *-- JobQueue
    StorageProvider <|.. S3StorageProvider
    MediaController --> FileMetadata : processes`;
    return result;
  }

  if (serviceName === "auth_service") {
    result.codeScaffold = `// authService.js
const jwt = require('jsonwebtoken');

app.post('/login', async (req, res) => {
  // Validate credentials...
  const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });
  
  await db.query('UPDATE users SET refresh_token_hash = $1', [hash(refreshToken)]);
  res.json({ accessToken, refreshToken });
});`;
    result.designPatterns = ["Decorator Pattern (Auth Middleware)", "Strategy Pattern (Auth Mechanisms: JWT/OAuth)"];
    result.classDiagram = `classDiagram
    class AuthController {
      -AuthStrategy strategy
      -TokenManager tokenManager
      +login(creds: Credentials) AuthResponse
      +refreshToken(token: String) AuthResponse
      +logout(userId: String) void
    }
    class TokenManager {
      -String jwtSecret
      +generateAccess(user: User) String
      +generateRefresh(user: User) String
      +verifyToken(token: String) UserPayload
    }
    class AuthStrategy {
      <<interface>>
      +authenticate(creds: Credentials) User
    }
    class PasswordAuthStrategy {
      -PasswordHasher hasher
      +authenticate(creds: Credentials) User
    }
    class OAuthStrategy {
      -OAuthClient client
      +authenticate(creds: Credentials) User
    }
    class User {
      +String id
      +String email
      +String role
      +Date lastLogin
    }
    AuthController *-- TokenManager
    AuthController *-- AuthStrategy
    AuthStrategy <|.. PasswordAuthStrategy
    AuthStrategy <|.. OAuthStrategy
    TokenManager --> User : encodes`;
    return result;
  }
  if (serviceName === "notification_service") {
    result.codeScaffold = `// notificationService.js
const { Kafka } = require('kafkajs');
const Redis = require('ioredis');
// Deduplication logic...`;
    result.designPatterns = ["Idempotent Receiver Pattern", "Observer Pattern", "Adapter Pattern (Third-party APIs)"];
    result.classDiagram = `classDiagram
    class NotificationEngine {
      -KafkaConsumer consumer
      -Deduplicator deduplicator
      -DeliveryRouter router
      +startProcessing() void
    }
    class Deduplicator {
      -RedisCache cache
      +isDuplicate(eventId: String) Boolean
    }
    class DeliveryRouter {
      -Map~String, DeliveryAdapter~ adapters
      +route(event: NotificationEvent) void
    }
    class DeliveryAdapter {
      <<interface>>
      +send(event: NotificationEvent) Boolean
    }
    class PushAdapter {
      -FCMClient fcm
      +send(event: NotificationEvent) Boolean
    }
    NotificationEngine *-- Deduplicator
    NotificationEngine *-- DeliveryRouter
    DeliveryRouter *-- DeliveryAdapter
    DeliveryAdapter <|.. PushAdapter`;
    return result;
  }

  if (serviceName === "search_service") {
    result.codeScaffold = `// searchService.js
// Elasticsearch client implementation`;
    result.designPatterns = ["CQRS", "Materialized View Pattern"];
    result.classDiagram = `classDiagram
    class SearchController {
      -SearchEngine engine
      +query(q: String) Results
    }
    class SearchEngine {
      -ElasticsearchClient es
      +executeSearch(query: Query) Results
    }`;
    return result;
  }

  // For any other service, do not show a generic class diagram or scaffold
  return result;
};

function expandService(serviceName, decisions, featureFlags) {
  const lld = { service: serviceName, layers: {} };
  const hasRedis = decisions.dataLayer.some(d => d.includes("cache") || d.includes("Redis"));
  const hasKafka = decisions.asyncLayer.length > 0;
  const isGrpc = featureFlags.useGrpc;
  const isGraphql = featureFlags.useGraphql;

  // ─────────────────────────────────────────
  // AUTH SERVICE — Identity & Access Mgmt
  // ─────────────────────────────────────────
  if (serviceName === "auth_service") {
    lld.layers["API Contracts"] = isGrpc
      ? ["gRPC AuthService.proto", "Interceptors (JWT verification)", "TLS mutual auth"]
      : ["POST /auth/login", "POST /auth/refresh", "POST /auth/logout", "DELETE /auth/sessions"];

    lld.layers["Auth Domain"] = [
      "Credential Validator (bcrypt compare)",
      "Access Token Factory (JWT, 15min TTL)",
      "Refresh Token Rotator (7d, hashed in DB)",
      featureFlags.requiresCompliance ? "MFA Enforcer (TOTP + SMS fallback)" : "Optional MFA Stub",
      featureFlags.requiresCompliance ? "Audit Trail Logger (every login attempt)" : "Standard Login Logging"
    ];

    lld.layers["Token Management"] = [
      "Token Signing Service (RS256 / HS256)",
      "Token Revocation Blacklist (Redis SET, TTL = access token expiry)",
      "Refresh Token Rotation on Every Use",
      "Session Registry (user ↔ device map)"
    ];

    lld.layers["Security Controls"] = [
      "Rate Limiter per IP (sliding window, Redis)",
      "Brute Force Lockout (5 failures → 15m ban)",
      featureFlags.requiresCompliance ? "PKCE OAuth2 Flow (RFC 7636)" : "Standard OAuth2 Code Flow",
      "CORS Policy Enforcement",
      "Security Header Middleware (Helmet.js)"
    ];

    lld.layers["Persistence"] = [
      "UserCredentialsRepository (write DB)",
      "SessionStore (Redis, 7d TTL)",
      "AuditLogRepository (append-only)"
    ];

    lld.layers["Observability"] = [
      "Login Success/Failure Rate (Prometheus counter)",
      "Active Sessions Gauge",
      featureFlags.needsDistributedTracing ? "OpenTelemetry trace: login → token issue → session" : "Structured JSON audit log"
    ];

    lld.designPatterns = [
      "Strategy Pattern — Pluggable auth backends (JWT, OAuth2, SAML)",
      "Decorator Pattern — Auth middleware wraps all protected routes",
      "Token Bucket — Rate limiting per IP",
      "Chain of Responsibility — Auth pipeline stages",
      featureFlags.requiresCompliance ? "PKCE Pattern — Proof Key for Code Exchange" : "Standard Delegation Pattern"
    ];

    lld.classDiagram = `classDiagram
    class AuthController {
      -AuthPipeline pipeline
      +login(creds: Credentials) AuthResponse
      +refresh(token: String) AuthResponse
      +logout(userId: String) void
    }
    class AuthPipeline {
      -List~AuthStage~ stages
      +execute(context: AuthContext) AuthContext
    }
    class AuthStage {
      <<interface>>
      +process(context: AuthContext) AuthContext
    }
    class CredentialValidatorStage {
      -PasswordHasher hasher
      -UserRepo repo
      +process(ctx: AuthContext) AuthContext
    }
    class MFAEnforcerStage {
      -TOTPVerifier totp
      +process(ctx: AuthContext) AuthContext
    }
    class TokenFactoryStage {
      -TokenSigner signer
      +process(ctx: AuthContext) AuthContext
    }
    class TokenSigner {
      -String privateKey
      +signAccess(payload: Object) String
      +signRefresh(payload: Object) String
      +verify(token: String) Payload
    }
    class SessionRegistry {
      -RedisCache cache
      +register(userId: String, deviceId: String) void
      +revoke(refreshToken: String) void
      +isRevoked(token: String) Boolean
    }
    class AuditLogger {
      +log(event: AuthEvent) void
    }
    AuthController *-- AuthPipeline
    AuthPipeline *-- AuthStage
    AuthStage <|.. CredentialValidatorStage
    AuthStage <|.. MFAEnforcerStage
    AuthStage <|.. TokenFactoryStage
    TokenFactoryStage *-- TokenSigner
    AuthController *-- SessionRegistry
    AuthController *-- AuditLogger`;
    lld.designPatterns.push(...getAppTypePatterns(serviceName, f));
    return lld;
  }

  // ─────────────────────────────────────────
  // FEED SERVICE — Social Feed Engine
  // ─────────────────────────────────────────
  if (serviceName === "feed_service") {
    lld.layers["API Contracts"] = isGraphql
      ? ["Query: userFeed(cursor, limit)", "Mutation: createPost(content, media)", "Subscription: newPost(userId)"]
      : ["GET /feed?cursor&limit (paginated)", "POST /posts", "DELETE /posts/:id", "GET /posts/:id/likes"];

    lld.layers["Fan-out Strategy"] = [
      "Fan-out on Write → for users with <10K followers (push model)",
      "Fan-out on Read → for celebrities >10K followers (pull model)",
      "Hybrid Router — evaluates follower count at publish time",
      "Redis Pipeline (batch LPUSH across follower feeds, 0-499 cap)",
      f.isCqrs ? "Command: PublishPostCommand | Query: GetFeedQuery (CQRS split)" : "Unified FeedService handler"
    ];

    lld.layers["Ranking Engine"] = [
      "Chronological Sort (baseline)",
      "Engagement Score Calculator (likes × w1 + comments × w2 + shares × w3)",
      "Freshness Decay Function (time-weighted)",
      "User Interest Vector (offline ML model output)",
      "A/B Experiment Slot Injector"
    ];

    lld.layers["Cache Strategy"] = [
      "User Feed Cache (Redis List, key: user_feed:{id}, max 500 posts)",
      "Post Metadata Cache (Redis Hash, TTL: 10min)",
      "Hot Post Pre-warming (top 1% posts pinned in L1 cache)",
      "Cache Invalidation on Post Delete",
      "Write-Through on Post Create"
    ];

    lld.layers["Persistence"] = [
      "PostRepository → PostgreSQL (write) + Read Replica (read)",
      "FollowGraphRepository → separate graph DB or adjacency list",
      "LikeCountRepository → Redis INCR (eventually consistent sync to DB)",
      f.isEventSourced ? "EventStore: PostPublished, PostLiked, PostDeleted" : "CRUD model with soft delete"
    ];

    lld.layers["Async Processing"] = hasKafka ? [
      "Kafka Topic: post.published → triggers notification fanout",
      "Kafka Topic: post.liked → updates engagement counters",
      "DLQ: failed fanout messages retried with exponential backoff",
      "Idempotency: post_id used as deduplication key"
    ] : ["Queue: post published events", "Worker: async follow-graph fan-out"];

    lld.designPatterns = [
      "CQRS — Separate write (publish) from read (feed query) paths",
      "Strategy Pattern — Fan-out algorithm: Push vs Pull vs Hybrid",
      "Cache-Aside — Feed loaded from Redis, DB fallback on miss",
      "Observer Pattern — New post triggers follower feed updates",
      "Composite Pattern — Feed items merged from push + pull sources",
      "Cursor Pagination Pattern — Infinite scroll via cursor token"
    ];

    lld.classDiagram = `classDiagram
    class FeedController {
      -FeedService svc
      +getUserFeed(userId: String, cursor: String) FeedPage
      +createPost(req: CreatePostRequest) Post
    }
    class FeedService {
      -FanOutRouter fanOut
      -FeedRanker ranker
      -FeedRepository repo
      -RedisCache cache
      +publishPost(post: Post) void
      +composeFeed(userId: String, cursor: String) FeedPage
    }
    class FanOutRouter {
      -FollowGraphRepo followRepo
      +route(post: Post) FanOutStrategy
      +isCelebrity(userId: String) Boolean
    }
    class FanOutStrategy {
      <<interface>>
      +execute(post: Post, followers: List~String~) void
    }
    class PushFanOut {
      -RedisCache cache
      +execute(post: Post, followers: List~String~) void
    }
    class PullFanOut {
      -FeedRepository repo
      +execute(post: Post, followers: List~String~) void
    }
    class FeedRanker {
      -EngagementScorer scorer
      +rank(items: List~FeedItem~, context: UserContext) List~FeedItem~
    }
    class EngagementScorer {
      +score(item: FeedItem) Float
    }
    class Post {
      +String id
      +String authorId
      +String content
      +List~String~ mediaUrls
      +Int likeCount
      +Int commentCount
      +Date createdAt
      +PostStatus status
    }
    class PostStatus {
      <<enumeration>>
      DRAFT
      PUBLISHED
      DELETED
    }
    FeedController *-- FeedService
    FeedService *-- FanOutRouter
    FeedService *-- FeedRanker
    FanOutRouter --> FanOutStrategy
    FanOutStrategy <|.. PushFanOut
    FanOutStrategy <|.. PullFanOut
    FeedRanker *-- EngagementScorer
    FeedService --> Post`;
    lld.designPatterns.push(...getAppTypePatterns(serviceName, f));
    return lld;
  }

  // ─────────────────────────────────────────
  // CHAT SERVICE — Real-Time Messaging
  // ─────────────────────────────────────────
  if (serviceName === "chat_service") {
    lld.layers["Transport Layer"] = [
      "WebSocket Server (Socket.io / ws)",
      "JWT Auth Handshake on Connect",
      "Room Registry (user ↔ rooms map in Redis)",
      "Heartbeat / Ping-Pong Keep-Alive (30s interval)",
      "Graceful Disconnect Handler"
    ];

    lld.layers["Pub/Sub Fan-out"] = [
      "Redis Pub/Sub Channel per Room (chat:room:{roomId})",
      "Multi-pod broadcast: all pods subscribe → fan message to connected sockets",
      "Message Ordering Guarantee via Redis Streams (XADD/XREAD)",
      "At-least-once delivery with client ACK"
    ];

    lld.layers["Message Persistence"] = [
      "Message Write to Cassandra (append-optimized, high write throughput)",
      "Message Read: time-range cursor pagination (last 50 msgs on load)",
      "Media Message: store S3 URL + metadata only",
      "Message Status FSM: SENT → DELIVERED → READ"
    ];

    lld.layers["Presence System"] = [
      "Online status: Redis SET user:presence:{id} = 'online' (TTL: 35s)",
      "Heartbeat refreshes TTL every 30s",
      "Offline event: TTL expiry triggers presence:offline Pub/Sub event",
      "Typing Indicator: ephemeral Redis key (TTL: 3s)"
    ];

    lld.layers["Async Events"] = hasKafka ? [
      "Kafka: message.sent → notification_service (offline push)",
      "Kafka: message.sent → analytics_service (event tracking)",
      "DLQ for failed notification delivery"
    ] : ["Queue: offline message delivery", "Worker: push notification trigger"];

    lld.designPatterns = [
      "Pub/Sub Pattern — Redis channels for cross-pod message broadcast",
      "Observer Pattern — Socket listeners react to room events",
      "State Machine — Message lifecycle (SENT → DELIVERED → READ)",
      "Singleton Pattern — Redis pub/sub client (one connection per pod)",
      "Proxy Pattern — WebSocket gateway abstracts pod topology from client",
      "Idempotent Consumer — Client-side deduplication by message ID"
    ];

    lld.classDiagram = `classDiagram
    class ChatGateway {
      -WebSocketManager wsManager
      -PubSubBroker broker
      -PresenceTracker presence
      +handleConnect(socket: Socket) void
      +handleDisconnect(userId: String) void
      +handleMessage(socket: Socket, msg: MessageDTO) void
    }
    class WebSocketManager {
      -Map~String, Socket~ connections
      +register(userId: String, socket: Socket) void
      +broadcast(roomId: String, event: String, data: Object) void
      +getSocket(userId: String) Socket
    }
    class PubSubBroker {
      -Redis pubClient
      -Redis subClient
      +publish(channel: String, message: ChatMessage) void
      +subscribe(channel: String) void
      +onMessage(handler: Function) void
    }
    class PresenceTracker {
      -RedisCache cache
      +setOnline(userId: String) void
      +setOffline(userId: String) void
      +isOnline(userId: String) Boolean
      +setTyping(userId: String, roomId: String) void
    }
    class ChatMessage {
      +String id
      +String senderId
      +String roomId
      +String content
      +MessageType type
      +MessageStatus status
      +Date sentAt
    }
    class MessageType {
      <<enumeration>>
      TEXT
      IMAGE
      VIDEO
      FILE
    }
    class MessageStatus {
      <<enumeration>>
      SENT
      DELIVERED
      READ
      FAILED
    }
    class MessageRepository {
      -CassandraClient db
      +save(msg: ChatMessage) void
      +findByRoom(roomId: String, cursor: Date) List~ChatMessage~
    }
    ChatGateway *-- WebSocketManager
    ChatGateway *-- PubSubBroker
    ChatGateway *-- PresenceTracker
    ChatGateway --> MessageRepository : persists
    ChatMessage --> MessageType
    ChatMessage --> MessageStatus`;
    lld.designPatterns.push(...getAppTypePatterns(serviceName, f));
    return lld;
  }

  // ─────────────────────────────────────────
  // MEDIA SERVICE — Upload & Processing
  // ─────────────────────────────────────────
  if (serviceName === "media_service") {
    lld.layers["Upload API"] = [
      "GET /media/upload-url?filename&type → returns pre-signed S3 URL",
      "POST /media/webhook (S3 event on upload complete)",
      "DELETE /media/:id (soft delete + CDN cache purge)",
      "GET /media/:id/status (processing status)"
    ];

    lld.layers["Upload Flow"] = [
      "Client requests pre-signed URL (5 min expiry) — avoids routing file through server",
      "Client uploads directly to S3 (bypasses backend bandwidth)",
      "S3 triggers event notification → SQS/SNS → Media processor worker",
      "Metadata stored in DB on webhook receipt"
    ];

    lld.layers["Processing Pipeline"] = [
      "Image: Sharp.js resize → WebP conversion → thumbnail generation",
      "Video: FFmpeg transcoding (1080p / 720p / 360p adaptive bitrate)",
      "CDN Invalidation on reprocess",
      "Virus/malware scanning hook (ClamAV)",
      "NSFW content classifier (ML model webhook)"
    ];

    lld.layers["Storage Strategy"] = [
      "S3 Standard → for recent media (< 90 days)",
      "S3-IA → for older media (> 90 days, lifecycle rule)",
      "S3 Glacier → archive > 1 year",
      "CloudFront CDN → edge-cached delivery, signed URLs for private media",
      "Metadata DB → PostgreSQL (file_id, s3_key, cdn_url, status, owner_id)"
    ];

    lld.layers["Security"] = [
      "Pre-signed URL scoped to exact file key (no wildcard)",
      "Content-Type enforcement on upload (reject mismatched MIME)",
      f.requiresCompliance ? "KMS encryption at rest (SSE-KMS)" : "SSE-S3 encryption at rest",
      "Max file size enforcement (server-side validation before URL generation)"
    ];

    lld.designPatterns = [
      "Proxy Pattern — Pre-signed URL delegates upload to S3, client bypasses server",
      "Factory Method — URL factory produces scoped, time-limited upload URLs",
      "Pipeline Pattern — Media processing: validate → transcode → compress → deliver",
      "Async Worker Pattern — Heavy processing offloaded to background workers",
      "Lifecycle Pattern — S3 lifecycle rules automate hot→warm→cold storage tiers"
    ];

    lld.classDiagram = `classDiagram
    class MediaController {
      -StorageProvider storage
      -MediaProcessorQueue queue
      -MediaRepository repo
      +generateUploadUrl(req: UploadRequest) UploadUrlResponse
      +handleWebhook(event: S3Event) void
      +getMediaStatus(mediaId: String) MediaStatus
    }
    class StorageProvider {
      <<interface>>
      +getPresignedUploadUrl(meta: FileMetadata) String
      +deleteObject(key: String) Boolean
      +invalidateCDN(key: String) void
    }
    class S3StorageProvider {
      -AWS.S3 s3
      -String bucket
      -String cdnDomain
      +getPresignedUploadUrl(meta: FileMetadata) String
      +deleteObject(key: String) Boolean
      +invalidateCDN(key: String) void
    }
    class MediaProcessorQueue {
      -KafkaProducer producer
      +enqueue(job: ProcessingJob) void
    }
    class ProcessingJob {
      +String mediaId
      +String s3Key
      +MediaType type
      +List~ProcessingStep~ steps
    }
    class MediaType {
      <<enumeration>>
      IMAGE
      VIDEO
      AUDIO
      DOCUMENT
    }
    class FileMetadata {
      +String filename
      +String mimeType
      +Long sizeBytes
      +String ownerId
      +Boolean isPrivate
      +validate() Boolean
    }
    class MediaRepository {
      -PostgreSQLClient db
      +save(media: MediaRecord) void
      +updateStatus(id: String, status: MediaStatus) void
      +findById(id: String) MediaRecord
    }
    MediaController *-- StorageProvider
    MediaController *-- MediaProcessorQueue
    MediaController *-- MediaRepository
    StorageProvider <|.. S3StorageProvider
    MediaProcessorQueue --> ProcessingJob
    ProcessingJob --> MediaType
    MediaController --> FileMetadata`;
    lld.designPatterns.push(...getAppTypePatterns(serviceName, f));
    return lld;
  }

  // ─────────────────────────────────────────
  // NOTIFICATION SERVICE — Push/Email/In-App
  // ─────────────────────────────────────────
  if (serviceName === "notification_service") {
    lld.layers["Event Consumers"] = [
      "Kafka Consumer: post.published → notify followers",
      "Kafka Consumer: message.sent → notify offline user",
      "Kafka Consumer: follow.new → notify followee",
      "Consumer Group per notification type (independent scaling)"
    ];

    lld.layers["Deduplication"] = [
      "Redis SETNX: notif:dedup:{eventId} (TTL: 24h)",
      "Idempotency enforced before any delivery attempt",
      "Message replay safe: second processing is no-op"
    ];

    lld.layers["Preference Engine"] = [
      "Do-Not-Disturb window check (timezone-aware)",
      "Per-user channel preferences (push / email / in-app / SMS)",
      "Notification frequency cap (max 10/hour per user)",
      "Category mute settings (likes, follows, comments independently)"
    ];

    lld.layers["Delivery Channels"] = [
      "Push: Firebase Cloud Messaging (FCM) for Android + APNs for iOS",
      "Email: AWS SES / SendGrid (templated, tracked)",
      "In-App: Redis Pub/Sub → WebSocket delivery to online users",
      f.requiresCompliance ? "SMS: Twilio with audit log of all messages" : "SMS: Twilio (optional)"
    ];

    lld.layers["Retry & Reliability"] = [
      "Exponential backoff on FCM failure (1s → 2s → 4s → DLQ)",
      "DLQ: failed notifications visible for ops debugging",
      "Device token staleness handler (remove invalid FCM tokens)",
      "Batch delivery for bulk notifications (max 500/batch FCM)"
    ];

    lld.designPatterns = [
      "Idempotent Consumer — Redis dedup before every delivery",
      "Chain of Responsibility — Preference filter → DND check → Deliver",
      "Adapter Pattern — Unified DeliveryAdapter interface over FCM/SES/Twilio",
      "Observer Pattern — Events trigger notification workflows",
      "Strategy Pattern — Channel selection based on user preference",
      "Outbox Pattern — Guaranteed at-least-once notification delivery"
    ];

    lld.classDiagram = `classDiagram
    class NotificationEngine {
      -EventConsumerGroup consumers
      -Deduplicator dedup
      -PreferenceEngine prefs
      -DeliveryRouter router
      +processEvent(event: DomainEvent) void
    }
    class Deduplicator {
      -RedisCache cache
      +check(eventId: String) Boolean
      +markProcessed(eventId: String) void
    }
    class PreferenceEngine {
      -UserPrefsRepository repo
      +isAllowed(userId: String, category: String) Boolean
      +isDND(userId: String) Boolean
      +getChannels(userId: String) List~Channel~
    }
    class DeliveryRouter {
      -Map~Channel, DeliveryAdapter~ adapters
      +route(notification: Notification) void
    }
    class DeliveryAdapter {
      <<interface>>
      +send(notification: Notification) DeliveryResult
      +batchSend(notifications: List~Notification~) List~DeliveryResult~
    }
    class FCMAdapter {
      -FirebaseClient fcm
      +send(notification: Notification) DeliveryResult
      +batchSend(notifications: List~Notification~) List~DeliveryResult~
    }
    class SESAdapter {
      -AmazonSESClient ses
      -TemplateEngine tmpl
      +send(notification: Notification) DeliveryResult
    }
    class Channel {
      <<enumeration>>
      PUSH
      EMAIL
      IN_APP
      SMS
    }
    class RetryPolicy {
      -Int maxAttempts
      -BackoffStrategy backoff
      +shouldRetry(attempt: Int, error: Error) Boolean
      +getDelay(attempt: Int) Int
    }
    NotificationEngine *-- Deduplicator
    NotificationEngine *-- PreferenceEngine
    NotificationEngine *-- DeliveryRouter
    DeliveryRouter *-- DeliveryAdapter
    DeliveryAdapter <|.. FCMAdapter
    DeliveryAdapter <|.. SESAdapter
    DeliveryRouter *-- RetryPolicy
    PreferenceEngine --> Channel`;
    lld.designPatterns.push(...getAppTypePatterns(serviceName, f));
    return lld;
  }

  // ─────────────────────────────────────────
  // USER SERVICE — Profile & Social Graph
  // ─────────────────────────────────────────
  if (serviceName === "user_service") {
    lld.layers["API Contracts"] = isGraphql
      ? ["Query: getUser(id)", "Query: getFollowers(id, cursor)", "Mutation: follow(targetId)", "Mutation: updateProfile"]
      : ["GET /users/:id", "POST /users/:id/follow", "GET /users/:id/followers", "PATCH /users/me"];

    lld.layers["Profile Management"] = [
      "User Profile CRUD (avatar, bio, handle)",
      "Avatar Upload: delegates to media_service pre-signed URL",
      "Handle uniqueness enforcement (DB unique index + Redis lock)",
      "Profile visibility settings (public / private / friends)"
    ];

    lld.layers["Follow Graph"] = [
      "Adjacency list model (follows table: follower_id, followee_id)",
      f.isLargeScale ? "Graph DB (Neo4j) for deep relationship queries" : "SQL adjacency list",
      "Follower/Following count: Redis INCR (eventually synced to DB)",
      "Mutual follow detection (friendship state)",
      "Block list management"
    ];

    lld.layers["Cache"] = [
      "User profile: Redis Hash, TTL 5min",
      "Follower count: Redis, updated on follow/unfollow",
      "Cache invalidation on profile update"
    ];

    lld.designPatterns = [
      "Repository Pattern — Decouple data access from domain logic",
      "Cache-Aside — Profile fetched from Redis, DB fallback",
      "CQRS Light — Separate read (profile view) from write (update) models",
      f.isLargeScale ? "Graph Database Pattern — Neo4j for social graph traversal" : "Adjacency List Pattern — SQL follow graph"
    ];

    lld.classDiagram = `classDiagram
    class UserController {
      -UserService svc
      +getProfile(userId: String) UserProfile
      +follow(followerId: String, targetId: String) void
      +getFollowers(userId: String, cursor: String) FollowerPage
    }
    class UserService {
      -UserRepository repo
      -FollowGraphRepository graphRepo
      -RedisCache cache
      +getProfile(userId: String) UserProfile
      +follow(followerId: String, targetId: String) void
      +unfollow(followerId: String, targetId: String) void
    }
    class UserProfile {
      +String id
      +String handle
      +String displayName
      +String bio
      +String avatarUrl
      +Int followerCount
      +Int followingCount
      +ProfileVisibility visibility
    }
    class ProfileVisibility {
      <<enumeration>>
      PUBLIC
      PRIVATE
      FRIENDS_ONLY
    }
    class FollowGraphRepository {
      +follow(a: String, b: String) void
      +unfollow(a: String, b: String) void
      +getFollowers(userId: String) List~String~
      +getFollowerCount(userId: String) Int
    }
    UserController *-- UserService
    UserService --> UserProfile
    UserService *-- FollowGraphRepository
    UserProfile --> ProfileVisibility`;
    lld.designPatterns.push(...getAppTypePatterns(serviceName, f));
    return lld;
  }

  // ─────────────────────────────────────────
  // SEARCH SERVICE
  // ─────────────────────────────────────────
  if (serviceName === "search_service") {
    lld.layers["API Contracts"] = ["GET /search?q&type&cursor", "GET /search/trending", "GET /search/autocomplete?q"];

    lld.layers["Query Pipeline"] = [
      "Query parser & tokenizer",
      "Spell correction (Elasticsearch did_you_mean)",
      "Query boost by engagement score + recency",
      "Typo-tolerance via fuzzy matching (fuzziness: AUTO)",
      "Multi-field search: username, bio, post content, hashtag"
    ];

    lld.layers["Indexing"] = [
      "Event-driven indexing: Kafka consumer receives entity.created/updated",
      "Elasticsearch index per entity type (users, posts, hashtags)",
      "Index alias with zero-downtime reindexing",
      "Bulk index with 1s flush interval"
    ];

    lld.layers["Ranking"] = [
      "BM25 base relevance score",
      "Engagement multiplier (like_count + share_count)",
      "Personalization boost (user follow graph affinity)",
      "Trending hashtag score (time-decayed velocity)"
    ];

    lld.designPatterns = [
      "CQRS — Search is a read-only projection of domain events",
      "Materialized View Pattern — Search index is a denormalized read model",
      "Event-Driven Indexing — Domain events trigger index updates",
      "Decorator Pattern — Ranking decorates base relevance score"
    ];

    lld.classDiagram = `classDiagram
    class SearchController {
      -SearchEngine engine
      -AutocompleteEngine autocomplete
      +search(query: SearchQuery) SearchResult
      +autocomplete(prefix: String) List~Suggestion~
      +trending() List~String~
    }
    class SearchEngine {
      -ElasticsearchClient es
      -QueryBuilder qb
      -ResultRanker ranker
      +executeSearch(query: SearchQuery) SearchResult
    }
    class QueryBuilder {
      +build(q: String, filters: Filters) ESQuery
      +withFuzzy(fuzziness: String) QueryBuilder
      +withBoost(field: String, weight: Float) QueryBuilder
    }
    class ResultRanker {
      +rank(hits: List~Hit~, context: UserContext) List~Hit~
    }
    class IndexingWorker {
      -KafkaConsumer consumer
      -ElasticsearchClient es
      +handleEvent(event: DomainEvent) void
      +bulkIndex(docs: List~Document~) void
    }
    SearchController *-- SearchEngine
    SearchEngine *-- QueryBuilder
    SearchEngine *-- ResultRanker
    IndexingWorker --> SearchEngine : feeds`;
    lld.designPatterns.push(...getAppTypePatterns(serviceName, f));
    return lld;
  }

  // ─────────────────────────────────────────
  // GENERIC FALLBACK (infrastructure nodes)
  // ─────────────────────────────────────────
  lld.layers["Component"] = [`${serviceName} — Infrastructure component managed externally`];
  lld.designPatterns = [];
  lld.classDiagram = "";
  return lld;
}

function generateServiceExpansion(decisions, flags) {
  return {
    services: decisions.services.map(svc => expandService(svc, decisions, flags))
  };
}

module.exports = { generateServiceExpansion };