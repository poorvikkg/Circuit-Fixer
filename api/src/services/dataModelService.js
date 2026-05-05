// ===============================
// Data Model Generator (Schema)
// ===============================

// ── Social Schemas ──
function generateUserSchema() {
  return {
    name: "users", type: "table",
    fields: [
      { name: "id", type: "uuid", primary: true },
      { name: "username", type: "string", unique: true },
      { name: "email", type: "string", unique: true },
      { name: "password", type: "hashed_string" },
      { name: "created_at", type: "timestamp" }
    ]
  };
}
function generateChatSchema() {
  return {
    name: "messages", type: "collection",
    fields: [
      { name: "id", type: "uuid", primary: true },
      { name: "sender_id", type: "uuid" },
      { name: "receiver_id", type: "uuid" },
      { name: "message", type: "text" },
      { name: "timestamp", type: "timestamp" }
    ]
  };
}
function generateFeedSchema() {
  return {
    name: "posts", type: "collection",
    fields: [
      { name: "id", type: "uuid", primary: true },
      { name: "user_id", type: "uuid" },
      { name: "content", type: "text" },
      { name: "media_url", type: "string" },
      { name: "created_at", type: "timestamp" }
    ]
  };
}
function generateMediaSchema() {
  return {
    name: "media", type: "table",
    fields: [
      { name: "id", type: "uuid", primary: true },
      { name: "url", type: "string" },
      { name: "type", type: "string" },
      { name: "uploaded_at", type: "timestamp" }
    ]
  };
}

// ── E-Commerce Schemas ──
function generateProductSchema() {
  return {
    name: "products", type: "table",
    fields: [
      { name: "id", type: "uuid", primary: true },
      { name: "name", type: "string" },
      { name: "price", type: "decimal" },
      { name: "stock", type: "integer" }
    ]
  };
}
function generateOrderSchema() {
  return {
    name: "orders", type: "table",
    fields: [
      { name: "id", type: "uuid", primary: true },
      { name: "user_id", type: "uuid" },
      { name: "total_amount", type: "decimal" },
      { name: "status", type: "string" },
      { name: "created_at", type: "timestamp" }
    ]
  };
}
function generateCartSchema() {
  return {
    name: "cart_items", type: "table",
    fields: [
      { name: "id", type: "uuid", primary: true },
      { name: "user_id", type: "uuid" },
      { name: "product_id", type: "uuid" },
      { name: "quantity", type: "integer" }
    ]
  };
}

// ── Fintech Schemas ──
function generateAccountSchema() {
  return {
    name: "accounts", type: "table",
    fields: [
      { name: "id", type: "uuid", primary: true },
      { name: "user_id", type: "uuid" },
      { name: "balance", type: "decimal" },
      { name: "currency", type: "string" }
    ]
  };
}
function generateTransactionSchema() {
  return {
    name: "transactions", type: "table",
    fields: [
      { name: "id", type: "uuid", primary: true },
      { name: "account_id", type: "uuid" },
      { name: "amount", type: "decimal" },
      { name: "type", type: "string" },
      { name: "status", type: "string" },
      { name: "timestamp", type: "timestamp" }
    ]
  };
}

// ── Healthcare Schemas ──
function generatePatientSchema() {
  return {
    name: "patients", type: "table",
    fields: [
      { name: "id", type: "uuid", primary: true },
      { name: "first_name", type: "string" },
      { name: "last_name", type: "string" },
      { name: "dob", type: "date" },
      { name: "insurance_id", type: "string" }
    ]
  };
}
function generateAppointmentSchema() {
  return {
    name: "appointments", type: "table",
    fields: [
      { name: "id", type: "uuid", primary: true },
      { name: "patient_id", type: "uuid" },
      { name: "doctor_id", type: "uuid" },
      { name: "appointment_date", type: "timestamp" },
      { name: "status", type: "string" }
    ]
  };
}
function generateMedicalRecordSchema() {
  return {
    name: "medical_records", type: "table",
    fields: [
      { name: "id", type: "uuid", primary: true },
      { name: "patient_id", type: "uuid" },
      { name: "diagnosis", type: "text" },
      { name: "prescription", type: "text" },
      { name: "created_at", type: "timestamp" }
    ]
  };
}

// ── Gaming Schemas ──
function generatePlayerProfileSchema() {
  return {
    name: "player_profiles", type: "table",
    fields: [
      { name: "id", type: "uuid", primary: true },
      { name: "user_id", type: "uuid" },
      { name: "level", type: "integer" },
      { name: "xp", type: "integer" },
      { name: "rank", type: "string" }
    ]
  };
}
function generateMatchSchema() {
  return {
    name: "matches", type: "table",
    fields: [
      { name: "id", type: "uuid", primary: true },
      { name: "game_mode", type: "string" },
      { name: "start_time", type: "timestamp" },
      { name: "end_time", type: "timestamp" },
      { name: "winner_id", type: "uuid" }
    ]
  };
}
function generateInventorySchema() {
  return {
    name: "inventory", type: "table",
    fields: [
      { name: "id", type: "uuid", primary: true },
      { name: "player_id", type: "uuid" },
      { name: "item_id", type: "string" },
      { name: "quantity", type: "integer" }
    ]
  };
}

// ── Streaming Schemas ──
function generateVideoSchema() {
  return {
    name: "videos", type: "table",
    fields: [
      { name: "id", type: "uuid", primary: true },
      { name: "title", type: "string" },
      { name: "duration_sec", type: "integer" },
      { name: "cdn_url", type: "string" }
    ]
  };
}
function generateWatchHistorySchema() {
  return {
    name: "watch_history", type: "collection",
    fields: [
      { name: "id", type: "uuid", primary: true },
      { name: "user_id", type: "uuid" },
      { name: "video_id", type: "uuid" },
      { name: "progress_sec", type: "integer" },
      { name: "last_watched", type: "timestamp" }
    ]
  };
}

// ── SaaS Schemas ──
function generateTenantSchema() {
  return {
    name: "tenants", type: "table",
    fields: [
      { name: "id", type: "uuid", primary: true },
      { name: "name", type: "string" },
      { name: "domain", type: "string", unique: true },
      { name: "plan", type: "string" }
    ]
  };
}
function generateSubscriptionSchema() {
  return {
    name: "subscriptions", type: "table",
    fields: [
      { name: "id", type: "uuid", primary: true },
      { name: "tenant_id", type: "uuid" },
      { name: "status", type: "string" },
      { name: "renews_at", type: "timestamp" }
    ]
  };
}


// MAIN FUNCTION — builds all schemas based on appType
function generateDataModels(decisions, flags = {}) {
  const schemas = [];
  const appType = flags.appType || "social";

  // Everyone usually needs users
  schemas.push(generateUserSchema());

  // Add specific schemas based on domain
  if (appType === "ecommerce") {
    schemas.push(generateProductSchema(), generateOrderSchema(), generateCartSchema());
  } else if (appType === "fintech") {
    schemas.push(generateAccountSchema(), generateTransactionSchema());
  } else if (appType === "healthcare") {
    schemas.push(generatePatientSchema(), generateAppointmentSchema(), generateMedicalRecordSchema());
  } else if (appType === "gaming") {
    schemas.push(generatePlayerProfileSchema(), generateMatchSchema(), generateInventorySchema());
  } else if (appType === "streaming") {
    schemas.push(generateVideoSchema(), generateWatchHistorySchema());
  } else if (appType === "saas") {
    schemas.push(generateTenantSchema(), generateSubscriptionSchema());
  } else {
    // Default to Social / others based on selected services
    if (decisions.services.includes("chat_service")) schemas.push(generateChatSchema());
    if (decisions.services.includes("feed_service")) schemas.push(generateFeedSchema());
    if (decisions.services.includes("media_service")) schemas.push(generateMediaSchema());
  }

  const mermaidERDiagram = generateMermaidERDiagram(schemas, appType);

  return {
    schemas,
    mermaidERDiagram
  };
}

// Generates a Mermaid ER Diagram string from schemas
function generateMermaidERDiagram(schemas, appType) {
  let mermaidStr = "erDiagram\n";
  
  schemas.forEach(schema => {
    mermaidStr += `  ${schema.name} {\n`;
    schema.fields.forEach(field => {
      let type = field.type;
      let keyStr = "";
      if (field.primary) keyStr = "PK";
      else if (field.unique) keyStr = "UK";
      
      mermaidStr += `    ${type} ${field.name} ${keyStr}\n`;
    });
    mermaidStr += `  }\n\n`;
  });

  // Adding relationships based on domain
  if (appType === "ecommerce") {
    mermaidStr += `  users ||--o{ orders : "places"\n`;
    mermaidStr += `  users ||--o{ cart_items : "has"\n`;
    mermaidStr += `  products ||--o{ cart_items : "added to"\n`;
  } else if (appType === "fintech") {
    mermaidStr += `  users ||--o{ accounts : "owns"\n`;
    mermaidStr += `  accounts ||--o{ transactions : "makes"\n`;
  } else if (appType === "healthcare") {
    mermaidStr += `  patients ||--o{ appointments : "books"\n`;
    mermaidStr += `  patients ||--o{ medical_records : "has"\n`;
  } else if (appType === "gaming") {
    mermaidStr += `  users ||--o| player_profiles : "has"\n`;
    mermaidStr += `  player_profiles ||--o{ inventory : "owns"\n`;
    mermaidStr += `  player_profiles ||--o{ matches : "plays"\n`;
  } else if (appType === "streaming") {
    mermaidStr += `  users ||--o{ watch_history : "watches"\n`;
    mermaidStr += `  videos ||--o{ watch_history : "viewed in"\n`;
  } else if (appType === "saas") {
    mermaidStr += `  tenants ||--o{ users : "has"\n`;
    mermaidStr += `  tenants ||--o| subscriptions : "manages"\n`;
  } else {
    // Social
    const names = schemas.map(s => s.name);
    if (names.includes("posts")) mermaidStr += `  users ||--o{ posts : "creates"\n`;
    if (names.includes("messages")) mermaidStr += `  users ||--o{ messages : "sends/receives"\n`;
  }
  
  return mermaidStr;
}

module.exports = { generateDataModels };