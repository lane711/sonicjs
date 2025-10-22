// src/utils/sanitize.ts
function escapeHtml(text) {
  if (typeof text !== "string") {
    return "";
  }
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}
function sanitizeInput(input) {
  if (!input) {
    return "";
  }
  return escapeHtml(String(input).trim());
}
function sanitizeObject(obj, fields) {
  const sanitized = { ...obj };
  for (const field of fields) {
    if (typeof obj[field] === "string") {
      sanitized[field] = sanitizeInput(obj[field]);
    }
  }
  return sanitized;
}

// src/utils/template-renderer.ts
var TemplateRenderer = class {
  templateCache = /* @__PURE__ */ new Map();
  constructor() {
  }
  /**
   * Simple Handlebars-like template engine
   */
  renderTemplate(template, data) {
    let rendered = template;
    rendered = rendered.replace(/\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_match, arrayName, content) => {
      const array = this.getNestedValue(data, arrayName.trim());
      if (!Array.isArray(array)) return "";
      return array.map((item, index) => {
        const itemContext = {
          ...data,
          // Handle primitive items (for {{.}} syntax)
          ".": item,
          // Spread item properties if it's an object
          ...typeof item === "object" && item !== null ? item : {},
          "@index": index,
          "@first": index === 0,
          "@last": index === array.length - 1
        };
        return this.renderTemplate(content, itemContext);
      }).join("");
    });
    let ifCount = 0;
    while (rendered.includes("{{#if ") && ifCount < 100) {
      const previousRendered = rendered;
      rendered = rendered.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_match, condition, content) => {
        const value = this.getNestedValue(data, condition.trim());
        const isTruthy = value === true || value && value !== 0 && value !== "" && value !== null && value !== void 0;
        return isTruthy ? this.renderTemplate(content, data) : "";
      });
      if (previousRendered === rendered) break;
      ifCount++;
    }
    rendered = rendered.replace(/\{\{\{([^}]+)\}\}\}/g, (_match, variable) => {
      const value = this.getNestedValue(data, variable.trim());
      return value !== void 0 && value !== null ? String(value) : "";
    });
    rendered = rendered.replace(/\{\{([^}#\/]+)\s+([^}]+)\}\}/g, (match, helper, variable) => {
      const helperName = helper.trim();
      const varName = variable.trim();
      if (helperName === "titleCase") {
        const value = this.getNestedValue(data, varName);
        if (value !== void 0 && value !== null) {
          return this.titleCase(String(value));
        }
      }
      return match;
    });
    rendered = rendered.replace(/\{\{([^}#\/]+)\}\}/g, (match, variable) => {
      const trimmed = variable.trim();
      if (trimmed.includes(" ")) {
        return match;
      }
      const value = this.getNestedValue(data, trimmed);
      if (value === null) return "";
      if (value === void 0) return "";
      return String(value);
    });
    return rendered;
  }
  /**
   * Get nested value from object using dot notation
   */
  getNestedValue(obj, path) {
    if (!obj || path === "") return void 0;
    return path.split(".").reduce((current, key) => {
      if (current === null || current === void 0) return void 0;
      return current[key];
    }, obj);
  }
  /**
   * Title case helper function
   */
  titleCase(str) {
    return str.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }
  /**
   * Render a template string with data
   */
  render(template, data = {}) {
    return this.renderTemplate(template, data);
  }
  /**
   * Clear template cache (useful for development)
   */
  clearCache() {
    this.templateCache.clear();
  }
};
var templateRenderer = new TemplateRenderer();
function renderTemplate(template, data = {}) {
  return templateRenderer.render(template, data);
}

// src/utils/query-filter.ts
var QueryFilterBuilder = class {
  params = [];
  errors = [];
  /**
   * Build a complete SQL query from filter object
   */
  build(baseTable, filter) {
    this.params = [];
    this.errors = [];
    let sql = `SELECT * FROM ${baseTable}`;
    if (filter.where) {
      const whereClause = this.buildWhereClause(filter.where);
      if (whereClause) {
        sql += ` WHERE ${whereClause}`;
      }
    }
    if (filter.sort && filter.sort.length > 0) {
      const orderClauses = filter.sort.map((s) => `${this.sanitizeFieldName(s.field)} ${s.order.toUpperCase()}`).join(", ");
      sql += ` ORDER BY ${orderClauses}`;
    }
    if (filter.limit) {
      sql += ` LIMIT ?`;
      this.params.push(filter.limit);
    }
    if (filter.offset) {
      sql += ` OFFSET ?`;
      this.params.push(filter.offset);
    }
    return {
      sql,
      params: this.params,
      errors: this.errors
    };
  }
  /**
   * Build WHERE clause from filter group
   */
  buildWhereClause(group) {
    const clauses = [];
    if (group.and && group.and.length > 0) {
      const andClauses = group.and.map((condition) => this.buildCondition(condition)).filter((clause) => clause !== null);
      if (andClauses.length > 0) {
        clauses.push(`(${andClauses.join(" AND ")})`);
      }
    }
    if (group.or && group.or.length > 0) {
      const orClauses = group.or.map((condition) => this.buildCondition(condition)).filter((clause) => clause !== null);
      if (orClauses.length > 0) {
        clauses.push(`(${orClauses.join(" OR ")})`);
      }
    }
    return clauses.join(" AND ");
  }
  /**
   * Build a single condition
   */
  buildCondition(condition) {
    const field = this.sanitizeFieldName(condition.field);
    switch (condition.operator) {
      case "equals":
        return this.buildEquals(field, condition.value);
      case "not_equals":
        return this.buildNotEquals(field, condition.value);
      case "greater_than":
        return this.buildComparison(field, ">", condition.value);
      case "greater_than_equal":
        return this.buildComparison(field, ">=", condition.value);
      case "less_than":
        return this.buildComparison(field, "<", condition.value);
      case "less_than_equal":
        return this.buildComparison(field, "<=", condition.value);
      case "like":
        return this.buildLike(field, condition.value);
      case "contains":
        return this.buildContains(field, condition.value);
      case "in":
        return this.buildIn(field, condition.value);
      case "not_in":
        return this.buildNotIn(field, condition.value);
      case "all":
        return this.buildAll(field, condition.value);
      case "exists":
        return this.buildExists(field, condition.value);
      case "near":
        this.errors.push(`'near' operator not supported in SQLite. Use spatial extension or application-level filtering.`);
        return null;
      case "within":
        this.errors.push(`'within' operator not supported in SQLite. Use spatial extension or application-level filtering.`);
        return null;
      case "intersects":
        this.errors.push(`'intersects' operator not supported in SQLite. Use spatial extension or application-level filtering.`);
        return null;
      default:
        this.errors.push(`Unknown operator: ${condition.operator}`);
        return null;
    }
  }
  /**
   * Build equals condition
   */
  buildEquals(field, value) {
    if (value === null) {
      return `${field} IS NULL`;
    }
    this.params.push(value);
    return `${field} = ?`;
  }
  /**
   * Build not equals condition
   */
  buildNotEquals(field, value) {
    if (value === null) {
      return `${field} IS NOT NULL`;
    }
    this.params.push(value);
    return `${field} != ?`;
  }
  /**
   * Build comparison condition (>, >=, <, <=)
   */
  buildComparison(field, operator, value) {
    this.params.push(value);
    return `${field} ${operator} ?`;
  }
  /**
   * Build LIKE condition (case-insensitive, all words must be present)
   */
  buildLike(field, value) {
    const words = value.split(/\s+/).filter((w) => w.length > 0);
    if (words.length === 0) {
      return `1=1`;
    }
    const conditions = words.map((word) => {
      this.params.push(`%${word}%`);
      return `${field} LIKE ?`;
    });
    return `(${conditions.join(" AND ")})`;
  }
  /**
   * Build CONTAINS condition (case-insensitive substring)
   */
  buildContains(field, value) {
    this.params.push(`%${value}%`);
    return `${field} LIKE ?`;
  }
  /**
   * Build IN condition
   */
  buildIn(field, value) {
    let values;
    if (typeof value === "string") {
      values = value.split(",").map((v) => v.trim()).filter((v) => v.length > 0);
    } else if (Array.isArray(value)) {
      values = value;
    } else {
      values = [value];
    }
    if (values.length === 0) {
      return `1=0`;
    }
    const placeholders = values.map((v) => {
      this.params.push(v);
      return "?";
    }).join(", ");
    return `${field} IN (${placeholders})`;
  }
  /**
   * Build NOT IN condition
   */
  buildNotIn(field, value) {
    let values;
    if (typeof value === "string") {
      values = value.split(",").map((v) => v.trim()).filter((v) => v.length > 0);
    } else if (Array.isArray(value)) {
      values = value;
    } else {
      values = [value];
    }
    if (values.length === 0) {
      return `1=1`;
    }
    const placeholders = values.map((v) => {
      this.params.push(v);
      return "?";
    }).join(", ");
    return `${field} NOT IN (${placeholders})`;
  }
  /**
   * Build ALL condition (value must contain all items in list)
   * For SQLite, we'll check if a JSON array contains all values
   */
  buildAll(field, value) {
    let values;
    if (typeof value === "string") {
      values = value.split(",").map((v) => v.trim()).filter((v) => v.length > 0);
    } else if (Array.isArray(value)) {
      values = value;
    } else {
      values = [value];
    }
    if (values.length === 0) {
      return `1=1`;
    }
    const conditions = values.map((val) => {
      this.params.push(`%${val}%`);
      return `${field} LIKE ?`;
    });
    return `(${conditions.join(" AND ")})`;
  }
  /**
   * Build EXISTS condition
   */
  buildExists(field, value) {
    if (value) {
      return `${field} IS NOT NULL AND ${field} != ''`;
    } else {
      return `(${field} IS NULL OR ${field} = '')`;
    }
  }
  /**
   * Sanitize field names to prevent SQL injection
   */
  sanitizeFieldName(field) {
    const sanitized = field.replace(/[^a-zA-Z0-9_$.]/g, "");
    if (sanitized.includes(".")) {
      const [table, ...path] = sanitized.split(".");
      return `json_extract(${table}, '$.${path.join(".")}')`;
    }
    return sanitized;
  }
  /**
   * Parse filter from query string
   */
  static parseFromQuery(query) {
    const filter = {};
    if (query.where) {
      try {
        filter.where = typeof query.where === "string" ? JSON.parse(query.where) : query.where;
      } catch (e) {
        console.error("Failed to parse where clause:", e);
      }
    }
    if (!filter.where) {
      filter.where = { and: [] };
    }
    if (!filter.where.and) {
      filter.where.and = [];
    }
    const simpleFieldMappings = {
      "status": "status",
      "collection_id": "collection_id"
    };
    for (const [queryParam, dbField] of Object.entries(simpleFieldMappings)) {
      if (query[queryParam]) {
        filter.where.and.push({
          field: dbField,
          operator: "equals",
          value: query[queryParam]
        });
      }
    }
    if (query.limit) {
      filter.limit = Math.min(parseInt(query.limit), 1e3);
    }
    if (query.offset) {
      filter.offset = parseInt(query.offset);
    }
    if (query.sort) {
      try {
        filter.sort = typeof query.sort === "string" ? JSON.parse(query.sort) : query.sort;
      } catch (e) {
        console.error("Failed to parse sort clause:", e);
      }
    }
    return filter;
  }
};
function buildQuery(table, filter) {
  const builder = new QueryFilterBuilder();
  return builder.build(table, filter);
}

// src/utils/metrics.ts
var MetricsTracker = class {
  requests = [];
  windowSize = 1e4;
  // 10 seconds window
  /**
   * Record a new request
   */
  recordRequest() {
    const now = Date.now();
    this.requests.push({ timestamp: now });
    this.cleanup(now);
  }
  /**
   * Clean up old requests outside the window
   */
  cleanup(now) {
    const cutoff = now - this.windowSize;
    this.requests = this.requests.filter((req) => req.timestamp > cutoff);
  }
  /**
   * Get current requests per second
   */
  getRequestsPerSecond() {
    const now = Date.now();
    this.cleanup(now);
    if (this.requests.length === 0) {
      return 0;
    }
    const oneSecondAgo = now - 1e3;
    const recentRequests = this.requests.filter((req) => req.timestamp > oneSecondAgo);
    return recentRequests.length;
  }
  /**
   * Get total requests in the current window
   */
  getTotalRequests() {
    const now = Date.now();
    this.cleanup(now);
    return this.requests.length;
  }
  /**
   * Get average requests per second over the window
   */
  getAverageRPS() {
    const now = Date.now();
    this.cleanup(now);
    if (this.requests.length === 0) {
      return 0;
    }
    const windowSeconds = this.windowSize / 1e3;
    return this.requests.length / windowSeconds;
  }
};
var metricsTracker = new MetricsTracker();

// src/utils/version.ts
var SONICJS_VERSION = "2.0.0-beta.2";
function getCoreVersion() {
  return SONICJS_VERSION;
}

export { QueryFilterBuilder, SONICJS_VERSION, TemplateRenderer, buildQuery, escapeHtml, getCoreVersion, metricsTracker, renderTemplate, sanitizeInput, sanitizeObject, templateRenderer };
//# sourceMappingURL=chunk-OL2OE3VJ.js.map
//# sourceMappingURL=chunk-OL2OE3VJ.js.map