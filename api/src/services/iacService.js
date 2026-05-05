// ===============================
// Infrastructure-as-Code (IaC) Generator
// Generates deployment configs like Docker Compose based on architecture decisions
// ===============================

function generateIaC(decisions) {
  const services = decisions.services;
  const dataLayer = decisions.dataLayer;
  const asyncLayer = decisions.asyncLayer;
  const infra = decisions.infrastructure;

  let composeFile = `version: '3.8'\n\nservices:\n`;

  // 1. Edge / API Gateway
  const hasGateway = infra.some(infrastructureItem => infrastructureItem.includes("Gateway"));
  if (hasGateway || infra.includes("lb") || infra.includes("load_balancer")) {
    composeFile += `
  api-gateway:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
${services.map(serviceName => `      - ${serviceName.replace(/_/g, "-")}`).join("\n")}
    networks:
      - fixy-network
`;
  }

  // 2. Services
  services.forEach(service => {
    const serviceName = service.replace(/_/g, "-");
    composeFile += `
  ${serviceName}:
    build: ./${serviceName}
    environment:
      - NODE_ENV=production
      - PORT=3000
${dataLayer.some(database => database.includes("SQL")) ? `      - DATABASE_URL=postgres://user:pass@postgres:5432/db\n` : ''}${dataLayer.some(database => database.includes("Redis") || database.includes("cache")) ? `      - REDIS_URL=redis://redis:6379\n` : ''}${asyncLayer.some(asyncItem => asyncItem.includes("Kafka")) ? `      - KAFKA_BROKERS=kafka:9092\n` : ''}    networks:
      - fixy-network
`;
  });

  // 3. Data Layer
  if (dataLayer.some(database => database.includes("SQL") && !database.includes("NoSQL"))) {
    composeFile += `
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - fixy-network
`;
  }

  if (dataLayer.some(database => database.includes("NoSQL"))) {
    composeFile += `
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodata:/data/db
    networks:
      - fixy-network
`;
  }

  if (dataLayer.some(database => database.includes("Redis") || database.includes("cache"))) {
    composeFile += `
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    networks:
      - fixy-network
`;
  }

  // 4. Async Layer (Kafka/RabbitMQ)
  if (asyncLayer.some(asyncItem => asyncItem.includes("Kafka"))) {
    composeFile += `
  zookeeper:
    image: confluentinc/cp-zookeeper:7.3.2
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
    networks:
      - fixy-network

  kafka:
    image: confluentinc/cp-kafka:7.3.2
    depends_on:
      - zookeeper
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    networks:
      - fixy-network
`;
  }

  // 5. Observability (Prometheus / Grafana)
  if (decisions.infrastructure.includes("OpenTelemetry_Collector")) {
    composeFile += `
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - fixy-network

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    depends_on:
      - prometheus
    networks:
      - fixy-network
`;
  }

  // Networks & Volumes
  composeFile += `
networks:
  fixy-network:
    driver: bridge

volumes:
`;
  if (dataLayer.some(db => db.includes("SQL") && !db.includes("NoSQL"))) composeFile += `  pgdata:\n`;
  if (dataLayer.some(db => db.includes("NoSQL"))) composeFile += `  mongodata:\n`;
  if (dataLayer.some(db => db.includes("Redis") || db.includes("cache"))) composeFile += `  redisdata:\n`;

  return {
    dockerCompose: composeFile
  };
}

module.exports = { generateIaC };
