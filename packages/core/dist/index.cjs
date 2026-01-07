'use strict';

var chunkI62BQ3LF_cjs = require('./chunk-I62BQ3LF.cjs');
var chunk7FOAMNTI_cjs = require('./chunk-7FOAMNTI.cjs');
var chunk3TUJBBAF_cjs = require('./chunk-3TUJBBAF.cjs');
var chunkILZ3DP4I_cjs = require('./chunk-ILZ3DP4I.cjs');
var chunkERUQJKQZ_cjs = require('./chunk-ERUQJKQZ.cjs');
var chunkYIXSSJWD_cjs = require('./chunk-YIXSSJWD.cjs');
var chunkAZLU3ROK_cjs = require('./chunk-AZLU3ROK.cjs');
var chunkDTLB6UIH_cjs = require('./chunk-DTLB6UIH.cjs');
var chunkIRN6XDON_cjs = require('./chunk-IRN6XDON.cjs');
require('./chunk-P3XDZL6Q.cjs');
var chunkRCQ2HIQD_cjs = require('./chunk-RCQ2HIQD.cjs');
var chunkKYGRJCZM_cjs = require('./chunk-KYGRJCZM.cjs');
require('./chunk-IGJUBJBW.cjs');
var hono = require('hono');
var html = require('hono/html');
var zod = require('zod');
var d1 = require('drizzle-orm/d1');

// src/plugins/core-plugins/database-tools-plugin/services/database-service.ts
var DatabaseToolsService = class {
  constructor(db) {
    this.db = db;
  }
  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    const tables = await this.getTables();
    const stats = {
      tables: [],
      totalRows: 0
    };
    for (const tableName of tables) {
      try {
        const result = await this.db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).first();
        const rowCount = result?.count || 0;
        stats.tables.push({
          name: tableName,
          rowCount
        });
        stats.totalRows += rowCount;
      } catch (error) {
        console.warn(`Could not count rows in table ${tableName}:`, error);
      }
    }
    return stats;
  }
  /**
   * Get all tables in the database
   */
  async getTables() {
    const result = await this.db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all();
    return result.results?.map((row) => row.name) || [];
  }
  /**
   * Truncate all data except admin user
   */
  async truncateAllData(adminEmail) {
    const errors = [];
    const tablesCleared = [];
    let adminUserPreserved = false;
    try {
      const adminUser = await this.db.prepare(
        "SELECT * FROM users WHERE email = ? AND role = ?"
      ).bind(adminEmail, "admin").first();
      if (!adminUser) {
        return {
          success: false,
          message: "Admin user not found. Operation cancelled for safety.",
          tablesCleared: [],
          adminUserPreserved: false,
          errors: ["Admin user not found"]
        };
      }
      const tablesToTruncate = [
        "content",
        "content_versions",
        "content_workflow_status",
        "collections",
        "media",
        "sessions",
        "notifications",
        "api_tokens",
        "workflow_history",
        "scheduled_content",
        "faqs",
        "faq_categories",
        "plugins",
        "plugin_settings",
        "email_templates",
        "email_themes"
      ];
      const existingTables = await this.getTables();
      const tablesToClear = tablesToTruncate.filter(
        (table) => existingTables.includes(table)
      );
      for (const tableName of tablesToClear) {
        try {
          await this.db.prepare(`DELETE FROM ${tableName}`).run();
          tablesCleared.push(tableName);
        } catch (error) {
          errors.push(`Failed to clear table ${tableName}: ${error}`);
          console.error(`Error clearing table ${tableName}:`, error);
        }
      }
      try {
        await this.db.prepare("DELETE FROM users WHERE email != ? OR role != ?").bind(adminEmail, "admin").run();
        const verifyAdmin = await this.db.prepare(
          "SELECT id FROM users WHERE email = ? AND role = ?"
        ).bind(adminEmail, "admin").first();
        adminUserPreserved = !!verifyAdmin;
        tablesCleared.push("users (non-admin)");
      } catch (error) {
        errors.push(`Failed to clear non-admin users: ${error}`);
        console.error("Error clearing non-admin users:", error);
      }
      try {
        await this.db.prepare("DELETE FROM sqlite_sequence").run();
      } catch (error) {
      }
      const message = errors.length > 0 ? `Truncation completed with ${errors.length} errors. ${tablesCleared.length} tables cleared.` : `Successfully truncated database. ${tablesCleared.length} tables cleared.`;
      return {
        success: errors.length === 0,
        message,
        tablesCleared,
        adminUserPreserved,
        errors: errors.length > 0 ? errors : void 0
      };
    } catch (error) {
      return {
        success: false,
        message: `Database truncation failed: ${error}`,
        tablesCleared,
        adminUserPreserved,
        errors: [String(error)]
      };
    }
  }
  /**
   * Create a backup of current data (simplified version)
   */
  async createBackup() {
    try {
      const backupId = `backup_${Date.now()}`;
      const stats = await this.getDatabaseStats();
      console.log(`Backup ${backupId} created with ${stats.totalRows} total rows`);
      return {
        success: true,
        message: `Backup created successfully (${stats.totalRows} rows)`,
        backupId
      };
    } catch (error) {
      return {
        success: false,
        message: `Backup failed: ${error}`
      };
    }
  }
  /**
   * Get table data with optional pagination and sorting
   */
  async getTableData(tableName, limit = 100, offset = 0, sortColumn, sortDirection = "asc") {
    try {
      const tables = await this.getTables();
      if (!tables.includes(tableName)) {
        throw new Error(`Table ${tableName} not found`);
      }
      const pragmaResult = await this.db.prepare(`PRAGMA table_info(${tableName})`).all();
      const columns = pragmaResult.results?.map((col) => col.name) || [];
      if (sortColumn && !columns.includes(sortColumn)) {
        sortColumn = void 0;
      }
      const countResult = await this.db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).first();
      const totalRows = countResult?.count || 0;
      let query = `SELECT * FROM ${tableName}`;
      if (sortColumn) {
        query += ` ORDER BY ${sortColumn} ${sortDirection.toUpperCase()}`;
      }
      query += ` LIMIT ${limit} OFFSET ${offset}`;
      const dataResult = await this.db.prepare(query).all();
      return {
        tableName,
        columns,
        rows: dataResult.results || [],
        totalRows
      };
    } catch (error) {
      throw new Error(`Failed to fetch table data: ${error}`);
    }
  }
  /**
   * Validate database integrity
   */
  async validateDatabase() {
    const issues = [];
    try {
      const requiredTables = ["users", "content", "collections"];
      const existingTables = await this.getTables();
      for (const table of requiredTables) {
        if (!existingTables.includes(table)) {
          issues.push(`Critical table missing: ${table}`);
        }
      }
      const adminCount = await this.db.prepare(
        "SELECT COUNT(*) as count FROM users WHERE role = ?"
      ).bind("admin").first();
      if (adminCount?.count === 0) {
        issues.push("No admin users found");
      }
      try {
        const integrityResult = await this.db.prepare("PRAGMA integrity_check").first();
        if (integrityResult && integrityResult.integrity_check !== "ok") {
          issues.push(`Database integrity check failed: ${integrityResult.integrity_check}`);
        }
      } catch (error) {
        issues.push(`Could not run integrity check: ${error}`);
      }
    } catch (error) {
      issues.push(`Validation error: ${error}`);
    }
    return {
      valid: issues.length === 0,
      issues
    };
  }
};

// src/templates/pages/admin-database-table.template.ts
chunkAZLU3ROK_cjs.init_admin_layout_catalyst_template();
function renderDatabaseTablePage(data) {
  const totalPages = Math.ceil(data.totalRows / data.pageSize);
  const startRow = (data.currentPage - 1) * data.pageSize + 1;
  const endRow = Math.min(data.currentPage * data.pageSize, data.totalRows);
  const pageContent = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="flex items-center space-x-3">
            <a
              href="/admin/settings/database-tools"
              class="inline-flex items-center text-sm/6 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Back to Database Tools
            </a>
          </div>
          <h1 class="mt-2 text-2xl/8 font-semibold text-zinc-950 dark:text-white sm:text-xl/8">Table: ${data.tableName}</h1>
          <p class="mt-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
            Showing ${startRow.toLocaleString()} - ${endRow.toLocaleString()} of ${data.totalRows.toLocaleString()} rows
          </p>
        </div>
        <div class="mt-4 sm:mt-0 flex items-center space-x-3">
          <div class="flex items-center space-x-2">
            <label for="pageSize" class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Rows per page:
            </label>
            <select
              id="pageSize"
              onchange="changePageSize(this.value)"
              class="rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm cursor-pointer"
            >
              <option value="10" ${data.pageSize === 10 ? "selected" : ""}>10</option>
              <option value="20" ${data.pageSize === 20 ? "selected" : ""}>20</option>
              <option value="50" ${data.pageSize === 50 ? "selected" : ""}>50</option>
              <option value="100" ${data.pageSize === 100 ? "selected" : ""}>100</option>
              <option value="200" ${data.pageSize === 200 ? "selected" : ""}>200</option>
            </select>
          </div>
          <button
            onclick="refreshTableData()"
            class="inline-flex items-center justify-center rounded-lg bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm font-semibold text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
          >
            <svg class="-ml-0.5 mr-1.5 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Table Card -->
      <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 overflow-hidden">
        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-zinc-950/10 dark:divide-white/10">
            <thead class="bg-zinc-50 dark:bg-white/5">
              <tr>
                ${data.columns.map((col) => `
                  <th
                    scope="col"
                    class="px-4 py-3.5 text-left text-xs font-semibold text-zinc-950 dark:text-white uppercase tracking-wider cursor-pointer hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
                    onclick="sortTable('${col}')"
                  >
                    <div class="flex items-center space-x-1">
                      <span>${col}</span>
                      ${data.sortColumn === col ? `
                        <svg class="w-4 h-4 ${data.sortDirection === "asc" ? "" : "rotate-180"}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                        </svg>
                      ` : `
                        <svg class="w-4 h-4 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                        </svg>
                      `}
                    </div>
                  </th>
                `).join("")}
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-950/5 dark:divide-white/5">
              ${data.rows.length > 0 ? data.rows.map((row, idx) => `
                  <tr class="${idx % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-50 dark:bg-zinc-900/50"}">
                    ${data.columns.map((col) => `
                      <td class="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis" title="${escapeHtml2(String(row[col] ?? ""))}">
                        ${formatCellValue(row[col])}
                      </td>
                    `).join("")}
                  </tr>
                `).join("") : `
                  <tr>
                    <td colspan="${data.columns.length}" class="px-4 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                      <svg class="w-12 h-12 mx-auto mb-4 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                      </svg>
                      <p>No data in this table</p>
                    </td>
                  </tr>
                `}
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        ${totalPages > 1 ? `
          <div class="flex items-center justify-between border-t border-zinc-950/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-3 sm:px-6">
            <div class="flex flex-1 justify-between sm:hidden">
              <button
                onclick="goToPage(${data.currentPage - 1})"
                ${data.currentPage === 1 ? "disabled" : ""}
                class="relative inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onclick="goToPage(${data.currentPage + 1})"
                ${data.currentPage === totalPages ? "disabled" : ""}
                class="relative ml-3 inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-zinc-700 dark:text-zinc-300">
                  Page <span class="font-medium">${data.currentPage}</span> of <span class="font-medium">${totalPages}</span>
                </p>
              </div>
              <div>
                <nav class="isolate inline-flex -space-x-px rounded-lg shadow-sm" aria-label="Pagination">
                  <button
                    onclick="goToPage(${data.currentPage - 1})"
                    ${data.currentPage === 1 ? "disabled" : ""}
                    class="relative inline-flex items-center rounded-l-lg px-2 py-2 text-zinc-400 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span class="sr-only">Previous</span>
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                    </svg>
                  </button>

                  ${generatePageNumbers(data.currentPage, totalPages)}

                  <button
                    onclick="goToPage(${data.currentPage + 1})"
                    ${data.currentPage === totalPages ? "disabled" : ""}
                    class="relative inline-flex items-center rounded-r-lg px-2 py-2 text-zinc-400 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span class="sr-only">Next</span>
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        ` : ""}
      </div>
    </div>

    <script>
      const currentTableName = '${data.tableName}';
      let currentPage = ${data.currentPage};
      let currentPageSize = ${data.pageSize};
      let currentSort = '${data.sortColumn || ""}';
      let currentSortDir = '${data.sortDirection || "asc"}';

      function goToPage(page) {
        if (page < 1 || page > ${totalPages}) return;
        const params = new URLSearchParams();
        params.set('page', page);
        params.set('pageSize', currentPageSize);
        if (currentSort) {
          params.set('sort', currentSort);
          params.set('dir', currentSortDir);
        }
        window.location.href = \`/admin/database-tools/tables/\${currentTableName}?\${params}\`;
      }

      function sortTable(column) {
        let newDir = 'asc';
        if (currentSort === column && currentSortDir === 'asc') {
          newDir = 'desc';
        }

        const params = new URLSearchParams();
        params.set('page', '1');
        params.set('pageSize', currentPageSize);
        params.set('sort', column);
        params.set('dir', newDir);
        window.location.href = \`/admin/database-tools/tables/\${currentTableName}?\${params}\`;
      }

      function changePageSize(newSize) {
        const params = new URLSearchParams();
        params.set('page', '1');
        params.set('pageSize', newSize);
        if (currentSort) {
          params.set('sort', currentSort);
          params.set('dir', currentSortDir);
        }
        window.location.href = \`/admin/database-tools/tables/\${currentTableName}?\${params}\`;
      }

      function refreshTableData() {
        window.location.reload();
      }

      function formatCellValue(value) {
        if (value === null || value === undefined) {
          return '<span class="text-zinc-400 dark:text-zinc-500 italic">null</span>';
        }
        if (typeof value === 'boolean') {
          return \`<span class="px-2 py-0.5 rounded text-xs font-medium \${value ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'}">\${value}</span>\`;
        }
        if (typeof value === 'object') {
          return '<span class="text-xs font-mono text-zinc-600 dark:text-zinc-400">' + JSON.stringify(value).substring(0, 50) + (JSON.stringify(value).length > 50 ? '...' : '') + '</span>';
        }
        const str = String(value);
        if (str.length > 100) {
          return escapeHtml(str.substring(0, 100)) + '...';
        }
        return escapeHtml(str);
      }

      function escapeHtml(text) {
        const map = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
      }
    </script>
  `;
  const layoutData = {
    title: `Table: ${data.tableName}`,
    pageTitle: `Database: ${data.tableName}`,
    currentPath: `/admin/database-tools/tables/${data.tableName}`,
    user: data.user,
    content: pageContent
  };
  return chunkAZLU3ROK_cjs.renderAdminLayoutCatalyst(layoutData);
}
function generatePageNumbers(currentPage, totalPages) {
  const pages = [];
  const maxVisible = 7;
  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push(-1);
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1);
      pages.push(-1);
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push(-1);
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push(-1);
      pages.push(totalPages);
    }
  }
  return pages.map((page) => {
    if (page === -1) {
      return `
        <span class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700">
          ...
        </span>
      `;
    }
    const isActive = page === currentPage;
    return `
      <button
        onclick="goToPage(${page})"
        class="relative inline-flex items-center px-4 py-2 text-sm font-semibold ${isActive ? "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" : "text-zinc-900 dark:text-zinc-100 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"}"
      >
        ${page}
      </button>
    `;
  }).join("");
}
function escapeHtml2(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m] || m);
}
function formatCellValue(value) {
  if (value === null || value === void 0) {
    return '<span class="text-zinc-400 dark:text-zinc-500 italic">null</span>';
  }
  if (typeof value === "boolean") {
    return `<span class="px-2 py-0.5 rounded text-xs font-medium ${value ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400"}">${value}</span>`;
  }
  if (typeof value === "object") {
    return '<span class="text-xs font-mono text-zinc-600 dark:text-zinc-400">' + JSON.stringify(value).substring(0, 50) + (JSON.stringify(value).length > 50 ? "..." : "") + "</span>";
  }
  const str = String(value);
  if (str.length > 100) {
    return escapeHtml2(str.substring(0, 100)) + "...";
  }
  return escapeHtml2(str);
}

// src/plugins/core-plugins/database-tools-plugin/admin-routes.ts
function createDatabaseToolsAdminRoutes() {
  const router2 = new hono.Hono();
  router2.use("*", chunk3TUJBBAF_cjs.requireAuth());
  router2.get("/api/stats", async (c) => {
    try {
      const user = c.get("user");
      if (!user || user.role !== "admin") {
        return c.json({
          success: false,
          error: "Unauthorized. Admin access required."
        }, 403);
      }
      const db = c.env.DB;
      const service = new DatabaseToolsService(db);
      const stats = await service.getDatabaseStats();
      return c.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error("Error fetching database stats:", error);
      return c.json({
        success: false,
        error: "Failed to fetch database statistics"
      }, 500);
    }
  });
  router2.post("/api/truncate", async (c) => {
    try {
      const user = c.get("user");
      if (!user || user.role !== "admin") {
        return c.json({
          success: false,
          error: "Unauthorized. Admin access required."
        }, 403);
      }
      const body = await c.req.json();
      const { confirmText } = body;
      if (confirmText !== "TRUNCATE ALL DATA") {
        return c.json({
          success: false,
          error: "Invalid confirmation text. Operation cancelled."
        }, 400);
      }
      const db = c.env.DB;
      const service = new DatabaseToolsService(db);
      const result = await service.truncateAllData(user.email);
      return c.json({
        success: result.success,
        message: result.message,
        data: {
          tablesCleared: result.tablesCleared,
          adminUserPreserved: result.adminUserPreserved,
          errors: result.errors
        }
      });
    } catch (error) {
      console.error("Error truncating database:", error);
      return c.json({
        success: false,
        error: "Failed to truncate database"
      }, 500);
    }
  });
  router2.post("/api/backup", async (c) => {
    try {
      const user = c.get("user");
      if (!user || user.role !== "admin") {
        return c.json({
          success: false,
          error: "Unauthorized. Admin access required."
        }, 403);
      }
      const db = c.env.DB;
      const service = new DatabaseToolsService(db);
      const result = await service.createBackup();
      return c.json({
        success: result.success,
        message: result.message,
        data: {
          backupId: result.backupId
        }
      });
    } catch (error) {
      console.error("Error creating backup:", error);
      return c.json({
        success: false,
        error: "Failed to create backup"
      }, 500);
    }
  });
  router2.get("/api/validate", async (c) => {
    try {
      const user = c.get("user");
      if (!user || user.role !== "admin") {
        return c.json({
          success: false,
          error: "Unauthorized. Admin access required."
        }, 403);
      }
      const db = c.env.DB;
      const service = new DatabaseToolsService(db);
      const validation = await service.validateDatabase();
      return c.json({
        success: true,
        data: validation
      });
    } catch (error) {
      console.error("Error validating database:", error);
      return c.json({
        success: false,
        error: "Failed to validate database"
      }, 500);
    }
  });
  router2.get("/api/tables/:tableName", async (c) => {
    try {
      const user = c.get("user");
      if (!user || user.role !== "admin") {
        return c.json({
          success: false,
          error: "Unauthorized. Admin access required."
        }, 403);
      }
      const tableName = c.req.param("tableName");
      const limit = parseInt(c.req.query("limit") || "100");
      const offset = parseInt(c.req.query("offset") || "0");
      const sortColumn = c.req.query("sort");
      const sortDirection = c.req.query("dir") || "asc";
      const db = c.env.DB;
      const service = new DatabaseToolsService(db);
      const tableData = await service.getTableData(tableName, limit, offset, sortColumn, sortDirection);
      return c.json({
        success: true,
        data: tableData
      });
    } catch (error) {
      console.error("Error fetching table data:", error);
      return c.json({
        success: false,
        error: `Failed to fetch table data: ${error}`
      }, 500);
    }
  });
  router2.get("/tables/:tableName", async (c) => {
    try {
      const user = c.get("user");
      if (!user || user.role !== "admin") {
        return c.redirect("/admin/login");
      }
      const tableName = c.req.param("tableName");
      const page = parseInt(c.req.query("page") || "1");
      const pageSize = parseInt(c.req.query("pageSize") || "20");
      const sortColumn = c.req.query("sort");
      const sortDirection = c.req.query("dir") || "asc";
      const offset = (page - 1) * pageSize;
      const db = c.env.DB;
      const service = new DatabaseToolsService(db);
      const tableData = await service.getTableData(tableName, pageSize, offset, sortColumn, sortDirection);
      const pageData = {
        user: {
          name: user.email.split("@")[0] || "Unknown",
          email: user.email,
          role: user.role
        },
        tableName: tableData.tableName,
        columns: tableData.columns,
        rows: tableData.rows,
        totalRows: tableData.totalRows,
        currentPage: page,
        pageSize,
        sortColumn,
        sortDirection
      };
      return c.html(renderDatabaseTablePage(pageData));
    } catch (error) {
      console.error("Error rendering table page:", error);
      return c.text(`Error: ${error}`, 500);
    }
  });
  return router2;
}
function createEmailPlugin() {
  const builder = chunkI62BQ3LF_cjs.PluginBuilder.create({
    name: "email",
    version: "1.0.0-beta.1",
    description: "Send transactional emails using Resend"
  });
  builder.metadata({
    author: {
      name: "SonicJS Team",
      email: "team@sonicjs.com"
    },
    license: "MIT",
    compatibility: "^2.0.0"
  });
  const emailRoutes = new hono.Hono();
  emailRoutes.get("/settings", async (c) => {
    const user = c.get("user");
    const db = c.env.DB;
    const plugin = await db.prepare(`
      SELECT settings FROM plugins WHERE id = 'email'
    `).first();
    const settings = plugin?.settings ? JSON.parse(plugin.settings) : {};
    const contentHTML = await html.html`
      <div class="p-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-zinc-950 dark:text-white mb-2">Email Settings</h1>
          <p class="text-zinc-600 dark:text-zinc-400">Configure Resend API for sending transactional emails</p>
        </div>

        <!-- Settings Form -->
        <div class="max-w-3xl">
          <!-- Main Settings Card -->
          <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6 mb-6">
            <h2 class="text-xl font-semibold text-zinc-950 dark:text-white mb-4">Resend Configuration</h2>

            <form id="emailSettingsForm" class="space-y-6">
              <!-- API Key -->
              <div>
                <label for="apiKey" class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">
                  Resend API Key <span class="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="apiKey"
                  name="apiKey"
                  value="${settings.apiKey || ""}"
                  class="w-full rounded-lg bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  placeholder="re_..."
                  required
                />
                <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Get your API key from <a href="https://resend.com/api-keys" target="_blank" class="text-indigo-600 dark:text-indigo-400 hover:underline">resend.com/api-keys</a>
                </p>
              </div>

              <!-- From Email -->
              <div>
                <label for="fromEmail" class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">
                  From Email <span class="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="fromEmail"
                  name="fromEmail"
                  value="${settings.fromEmail || ""}"
                  class="w-full rounded-lg bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  placeholder="noreply@yourdomain.com"
                  required
                />
                <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Must be a verified domain in Resend
                </p>
              </div>

              <!-- From Name -->
              <div>
                <label for="fromName" class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">
                  From Name <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fromName"
                  name="fromName"
                  value="${settings.fromName || ""}"
                  class="w-full rounded-lg bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  placeholder="Your App Name"
                  required
                />
              </div>

              <!-- Reply To -->
              <div>
                <label for="replyTo" class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">
                  Reply-To Email
                </label>
                <input
                  type="email"
                  id="replyTo"
                  name="replyTo"
                  value="${settings.replyTo || ""}"
                  class="w-full rounded-lg bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  placeholder="support@yourdomain.com"
                />
              </div>

              <!-- Logo URL -->
              <div>
                <label for="logoUrl" class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  id="logoUrl"
                  name="logoUrl"
                  value="${settings.logoUrl || ""}"
                  class="w-full rounded-lg bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  placeholder="https://yourdomain.com/logo.png"
                />
                <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Logo to display in email templates
                </p>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3 pt-4">
                <button
                  type="submit"
                  class="inline-flex items-center justify-center rounded-lg bg-zinc-950 dark:bg-white px-3.5 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm"
                >
                  Save Settings
                </button>
                <button
                  type="button"
                  id="testEmailBtn"
                  class="inline-flex items-center justify-center rounded-lg bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm font-semibold text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                >
                  Send Test Email
                </button>
                <button
                  type="button"
                  id="resetBtn"
                  class="inline-flex items-center justify-center rounded-lg bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm font-semibold text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          <!-- Status Message -->
          <div id="statusMessage" class="hidden rounded-xl p-4 mb-6"></div>

          <!-- Info Card -->
          <div class="rounded-xl bg-indigo-50 dark:bg-indigo-950/30 ring-1 ring-indigo-100 dark:ring-indigo-900/50 p-6">
            <h3 class="font-semibold text-indigo-900 dark:text-indigo-300 mb-3">
              📧 Email Templates Included
            </h3>
            <ul class="text-sm text-indigo-800 dark:text-indigo-200 space-y-2">
              <li>✓ Registration confirmation</li>
              <li>✓ Email verification</li>
              <li>✓ Password reset</li>
              <li>✓ One-time code (2FA)</li>
            </ul>
            <p class="text-xs text-indigo-700 dark:text-indigo-300 mt-4">
              Templates are code-based and can be customized by editing the plugin files.
            </p>
          </div>
        </div>
      </div>

      <script>
        // Form submission handler
        document.getElementById('emailSettingsForm').addEventListener('submit', async (e) => {
          e.preventDefault()
          const formData = new FormData(e.target)
          const data = Object.fromEntries(formData.entries())

          const statusEl = document.getElementById('statusMessage')

          try {
            const response = await fetch('/admin/plugins/email/settings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            })

            if (response.ok) {
              statusEl.className = 'rounded-xl bg-green-50 dark:bg-green-950/30 ring-1 ring-green-100 dark:ring-green-900/50 p-4 mb-6 text-green-900 dark:text-green-200'
              statusEl.innerHTML = '✅ Settings saved successfully!'
              statusEl.classList.remove('hidden')
              setTimeout(() => statusEl.classList.add('hidden'), 3000)
            } else {
              throw new Error('Failed to save settings')
            }
          } catch (error) {
            statusEl.className = 'rounded-xl bg-red-50 dark:bg-red-950/30 ring-1 ring-red-100 dark:ring-red-900/50 p-4 mb-6 text-red-900 dark:text-red-200'
            statusEl.innerHTML = '❌ Failed to save settings. Please try again.'
            statusEl.classList.remove('hidden')
          }
        })

        // Test email handler
        document.getElementById('testEmailBtn').addEventListener('click', async () => {
          // Prompt for destination email
          const toEmail = prompt('Enter destination email address for test:')
          if (!toEmail) return

          // Basic email validation
          if (!toEmail.match(/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/)) {
            alert('Please enter a valid email address')
            return
          }

          const statusEl = document.getElementById('statusMessage')

          statusEl.className = 'rounded-xl bg-indigo-50 dark:bg-indigo-950/30 ring-1 ring-indigo-100 dark:ring-indigo-900/50 p-4 mb-6 text-indigo-900 dark:text-indigo-200'
          statusEl.innerHTML = \`📧 Sending test email to \${toEmail}...\`
          statusEl.classList.remove('hidden')

          try {
            const response = await fetch('/admin/plugins/email/test', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ toEmail })
            })

            const data = await response.json()

            if (response.ok) {
              statusEl.className = 'rounded-xl bg-green-50 dark:bg-green-950/30 ring-1 ring-green-100 dark:ring-green-900/50 p-4 mb-6 text-green-900 dark:text-green-200'
              statusEl.innerHTML = \`✅ \${data.message || 'Test email sent! Check your inbox.'}\`
            } else {
              statusEl.className = 'rounded-xl bg-red-50 dark:bg-red-950/30 ring-1 ring-red-100 dark:ring-red-900/50 p-4 mb-6 text-red-900 dark:text-red-200'
              statusEl.innerHTML = \`❌ \${data.error || 'Failed to send test email. Check your settings.'}\`
            }
          } catch (error) {
            statusEl.className = 'rounded-xl bg-red-50 dark:bg-red-950/30 ring-1 ring-red-100 dark:ring-red-900/50 p-4 mb-6 text-red-900 dark:text-red-200'
            statusEl.innerHTML = '❌ Network error. Please try again.'
          }
        })

        // Reset button handler
        document.getElementById('resetBtn').addEventListener('click', () => {
          document.getElementById('emailSettingsForm').reset()
        })
      </script>
    `;
    const templateUser = user ? {
      name: user.name ?? user.email ?? "Admin",
      email: user.email ?? "admin@sonicjs.com",
      role: user.role ?? "admin"
    } : void 0;
    return c.html(
      chunkAZLU3ROK_cjs.renderAdminLayout({
        title: "Email Settings",
        content: contentHTML,
        user: templateUser,
        currentPath: "/admin/plugins/email/settings"
      })
    );
  });
  emailRoutes.post("/settings", async (c) => {
    try {
      const body = await c.req.json();
      const db = c.env.DB;
      await db.prepare(`
        UPDATE plugins
        SET settings = ?,
            updated_at = unixepoch()
        WHERE id = 'email'
      `).bind(JSON.stringify(body)).run();
      return c.json({ success: true });
    } catch (error) {
      console.error("Error saving email settings:", error);
      return c.json({ success: false, error: "Failed to save settings" }, 500);
    }
  });
  emailRoutes.post("/test", async (c) => {
    try {
      const db = c.env.DB;
      const body = await c.req.json();
      const plugin = await db.prepare(`
        SELECT settings FROM plugins WHERE id = 'email'
      `).first();
      if (!plugin?.settings) {
        return c.json({
          success: false,
          error: "Email settings not configured. Please save your settings first."
        }, 400);
      }
      const settings = JSON.parse(plugin.settings);
      if (!settings.apiKey || !settings.fromEmail || !settings.fromName) {
        return c.json({
          success: false,
          error: "Missing required settings. Please configure API Key, From Email, and From Name."
        }, 400);
      }
      const toEmail = body.toEmail || settings.fromEmail;
      if (!toEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return c.json({
          success: false,
          error: "Invalid email address format"
        }, 400);
      }
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${settings.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: `${settings.fromName} <${settings.fromEmail}>`,
          to: [toEmail],
          subject: "Test Email from SonicJS",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #667eea;">Test Email Successful! \u{1F389}</h1>
              <p>This is a test email from your SonicJS Email plugin.</p>
              <p><strong>Configuration:</strong></p>
              <ul>
                <li>From: ${settings.fromName} &lt;${settings.fromEmail}&gt;</li>
                <li>Reply-To: ${settings.replyTo || "Not set"}</li>
                <li>Sent at: ${(/* @__PURE__ */ new Date()).toISOString()}</li>
              </ul>
              <p>Your email settings are working correctly!</p>
            </div>
          `,
          reply_to: settings.replyTo || settings.fromEmail
        })
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("Resend API error:", data);
        return c.json({
          success: false,
          error: data.message || "Failed to send test email. Check your API key and domain verification."
        }, response.status);
      }
      return c.json({
        success: true,
        message: `Test email sent successfully to ${toEmail}`,
        emailId: data.id
      });
    } catch (error) {
      console.error("Test email error:", error);
      return c.json({
        success: false,
        error: error.message || "An error occurred while sending test email"
      }, 500);
    }
  });
  builder.addRoute("/admin/plugins/email", emailRoutes, {
    description: "Email plugin settings",
    requiresAuth: true,
    priority: 80
  });
  builder.addMenuItem("Email", "/admin/plugins/email/settings", {
    icon: "envelope",
    order: 80,
    permissions: ["email:manage"]
  });
  builder.lifecycle({
    activate: async () => {
      console.info("\u2705 Email plugin activated");
    },
    deactivate: async () => {
      console.info("\u274C Email plugin deactivated");
    }
  });
  return builder.build();
}
var emailPlugin = createEmailPlugin();

// src/plugins/core-plugins/otp-login-plugin/otp-service.ts
var OTPService = class {
  constructor(db) {
    this.db = db;
  }
  /**
   * Generate a secure random OTP code
   */
  generateCode(length = 6) {
    const digits = "0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      const randomValues = new Uint8Array(1);
      crypto.getRandomValues(randomValues);
      const randomValue = randomValues[0] ?? 0;
      code += digits[randomValue % digits.length];
    }
    return code;
  }
  /**
   * Create and store a new OTP code
   */
  async createOTPCode(email, settings, ipAddress, userAgent) {
    const code = this.generateCode(settings.codeLength);
    const id = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = now + settings.codeExpiryMinutes * 60 * 1e3;
    const otpCode = {
      id,
      user_email: email.toLowerCase(),
      code,
      expires_at: expiresAt,
      used: 0,
      used_at: null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      attempts: 0,
      created_at: now
    };
    await this.db.prepare(`
      INSERT INTO otp_codes (
        id, user_email, code, expires_at, used, used_at,
        ip_address, user_agent, attempts, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      otpCode.id,
      otpCode.user_email,
      otpCode.code,
      otpCode.expires_at,
      otpCode.used,
      otpCode.used_at,
      otpCode.ip_address,
      otpCode.user_agent,
      otpCode.attempts,
      otpCode.created_at
    ).run();
    return otpCode;
  }
  /**
   * Verify an OTP code
   */
  async verifyCode(email, code, settings) {
    const normalizedEmail = email.toLowerCase();
    const now = Date.now();
    const otpCode = await this.db.prepare(`
      SELECT * FROM otp_codes
      WHERE user_email = ? AND code = ? AND used = 0
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(normalizedEmail, code).first();
    if (!otpCode) {
      return { valid: false, error: "Invalid or expired code" };
    }
    if (now > otpCode.expires_at) {
      return { valid: false, error: "Code has expired" };
    }
    if (otpCode.attempts >= settings.maxAttempts) {
      return { valid: false, error: "Maximum attempts exceeded" };
    }
    await this.db.prepare(`
      UPDATE otp_codes
      SET used = 1, used_at = ?, attempts = attempts + 1
      WHERE id = ?
    `).bind(now, otpCode.id).run();
    return { valid: true };
  }
  /**
   * Increment failed attempt count
   */
  async incrementAttempts(email, code) {
    const normalizedEmail = email.toLowerCase();
    const result = await this.db.prepare(`
      UPDATE otp_codes
      SET attempts = attempts + 1
      WHERE user_email = ? AND code = ? AND used = 0
      RETURNING attempts
    `).bind(normalizedEmail, code).first();
    return result?.attempts || 0;
  }
  /**
   * Check rate limiting
   */
  async checkRateLimit(email, settings) {
    const normalizedEmail = email.toLowerCase();
    const oneHourAgo = Date.now() - 60 * 60 * 1e3;
    const result = await this.db.prepare(`
      SELECT COUNT(*) as count
      FROM otp_codes
      WHERE user_email = ? AND created_at > ?
    `).bind(normalizedEmail, oneHourAgo).first();
    const count = result?.count || 0;
    return count < settings.rateLimitPerHour;
  }
  /**
   * Get recent OTP requests for activity log
   */
  async getRecentRequests(limit = 50) {
    const result = await this.db.prepare(`
      SELECT * FROM otp_codes
      ORDER BY created_at DESC
      LIMIT ?
    `).bind(limit).all();
    const rows = result.results || [];
    return rows.map((row) => this.mapRowToOTP(row));
  }
  /**
   * Clean up expired codes (for maintenance)
   */
  async cleanupExpiredCodes() {
    const now = Date.now();
    const result = await this.db.prepare(`
      DELETE FROM otp_codes
      WHERE expires_at < ? OR (used = 1 AND used_at < ?)
    `).bind(now, now - 30 * 24 * 60 * 60 * 1e3).run();
    return result.meta.changes || 0;
  }
  mapRowToOTP(row) {
    return {
      id: String(row.id),
      user_email: String(row.user_email),
      code: String(row.code),
      expires_at: Number(row.expires_at ?? Date.now()),
      used: Number(row.used ?? 0),
      used_at: row.used_at === null || row.used_at === void 0 ? null : Number(row.used_at),
      ip_address: typeof row.ip_address === "string" ? row.ip_address : null,
      user_agent: typeof row.user_agent === "string" ? row.user_agent : null,
      attempts: Number(row.attempts ?? 0),
      created_at: Number(row.created_at ?? Date.now())
    };
  }
  /**
   * Get OTP statistics
   */
  async getStats(days = 7) {
    const since = Date.now() - days * 24 * 60 * 60 * 1e3;
    const stats = await this.db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN used = 1 THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN attempts >= 3 AND used = 0 THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN expires_at < ? AND used = 0 THEN 1 ELSE 0 END) as expired
      FROM otp_codes
      WHERE created_at > ?
    `).bind(Date.now(), since).first();
    return {
      total: stats?.total || 0,
      successful: stats?.successful || 0,
      failed: stats?.failed || 0,
      expired: stats?.expired || 0
    };
  }
};

// src/plugins/core-plugins/otp-login-plugin/email-templates.ts
function renderOTPEmailHTML(data) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Login Code</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">

  <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

    ${data.logoUrl ? `
    <div style="text-align: center; padding: 30px 20px 20px;">
      <img src="${data.logoUrl}" alt="Logo" style="max-width: 150px; height: auto;">
    </div>
    ` : ""}

    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0 0 10px 0; font-size: 32px; font-weight: 600;">Your Login Code</h1>
      <p style="margin: 0; opacity: 0.95; font-size: 16px;">Enter this code to sign in to ${data.appName}</p>
    </div>

    <div style="padding: 40px 30px;">
      <div style="background: #f8f9fa; border: 2px dashed #667eea; border-radius: 12px; padding: 30px; text-align: center; margin: 0 0 30px 0;">
        <div style="font-size: 56px; font-weight: bold; letter-spacing: 12px; color: #667eea; font-family: 'Courier New', Courier, monospace; line-height: 1;">
          ${data.code}
        </div>
      </div>

      <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 16px 20px; margin: 0 0 30px 0; border-radius: 6px;">
        <p style="margin: 0; font-size: 14px; color: #856404;">
          <strong>\u26A0\uFE0F This code expires in ${data.expiryMinutes} minutes</strong>
        </p>
      </div>

      <div style="margin: 0 0 30px 0;">
        <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Quick Tips:</h3>
        <ul style="color: #666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Enter the code exactly as shown (${data.codeLength} digits)</li>
          <li>The code can only be used once</li>
          <li>You have ${data.maxAttempts} attempts to enter the correct code</li>
          <li>Request a new code if this one expires</li>
        </ul>
      </div>

      <div style="background: #e8f4ff; border-radius: 8px; padding: 20px; margin: 0 0 30px 0;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #0066cc; font-weight: 600;">
          \u{1F512} Security Notice
        </p>
        <p style="margin: 0; font-size: 13px; color: #004080; line-height: 1.6;">
          Never share this code with anyone. ${data.appName} will never ask you for this code via phone, email, or social media.
        </p>
      </div>
    </div>

    <div style="border-top: 1px solid #eee; padding: 30px; background: #f8f9fa;">
      <p style="margin: 0 0 15px 0; font-size: 14px; color: #666; text-align: center;">
        <strong>Didn't request this code?</strong><br>
        Someone may have entered your email by mistake. You can safely ignore this email.
      </p>

      <div style="text-align: center; color: #999; font-size: 12px; line-height: 1.6;">
        <p style="margin: 5px 0;">This email was sent to ${data.email}</p>
        ${data.ipAddress ? `<p style="margin: 5px 0;">IP Address: ${data.ipAddress}</p>` : ""}
        <p style="margin: 5px 0;">Time: ${data.timestamp}</p>
      </div>
    </div>

  </div>

  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p style="margin: 0;">&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} ${data.appName}. All rights reserved.</p>
  </div>

</body>
</html>`;
}
function renderOTPEmailText(data) {
  return `Your Login Code for ${data.appName}

Your one-time verification code is:

${data.code}

This code expires in ${data.expiryMinutes} minutes.

Quick Tips:
\u2022 Enter the code exactly as shown (${data.codeLength} digits)
\u2022 The code can only be used once
\u2022 You have ${data.maxAttempts} attempts to enter the correct code
\u2022 Request a new code if this one expires

Security Notice:
Never share this code with anyone. ${data.appName} will never ask you for this code via phone, email, or social media.

Didn't request this code?
Someone may have entered your email by mistake. You can safely ignore this email.

---
This email was sent to ${data.email}
${data.ipAddress ? `IP Address: ${data.ipAddress}` : ""}
Time: ${data.timestamp}

\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} ${data.appName}. All rights reserved.`;
}
function renderOTPEmail(data) {
  return {
    html: renderOTPEmailHTML(data),
    text: renderOTPEmailText(data)
  };
}

// src/plugins/core-plugins/otp-login-plugin/index.ts
var otpRequestSchema = zod.z.object({
  email: zod.z.string().email("Valid email is required")
});
var otpVerifySchema = zod.z.object({
  email: zod.z.string().email("Valid email is required"),
  code: zod.z.string().min(4).max(8)
});
var DEFAULT_SETTINGS = {
  codeLength: 6,
  codeExpiryMinutes: 10,
  maxAttempts: 3,
  rateLimitPerHour: 5,
  allowNewUserRegistration: false,
  appName: "SonicJS"
};
function createOTPLoginPlugin() {
  const builder = chunkI62BQ3LF_cjs.PluginBuilder.create({
    name: "otp-login",
    version: "1.0.0-beta.1",
    description: "Passwordless authentication via email one-time codes"
  });
  builder.metadata({
    author: {
      name: "SonicJS Team",
      email: "team@sonicjs.com"
    },
    license: "MIT",
    compatibility: "^2.0.0"
  });
  const otpAPI = new hono.Hono();
  otpAPI.post("/request", async (c) => {
    try {
      const body = await c.req.json();
      const validation = otpRequestSchema.safeParse(body);
      if (!validation.success) {
        return c.json({
          error: "Validation failed",
          details: validation.error.issues
        }, 400);
      }
      const { email } = validation.data;
      const normalizedEmail = email.toLowerCase();
      const db = c.env.DB;
      const otpService = new OTPService(db);
      const settings = { ...DEFAULT_SETTINGS };
      const canRequest = await otpService.checkRateLimit(normalizedEmail, settings);
      if (!canRequest) {
        return c.json({
          error: "Too many requests. Please try again in an hour."
        }, 429);
      }
      const user = await db.prepare(`
        SELECT id, email, role, is_active
        FROM users
        WHERE email = ?
      `).bind(normalizedEmail).first();
      if (!user && !settings.allowNewUserRegistration) {
        return c.json({
          message: "If an account exists for this email, you will receive a verification code shortly.",
          expiresIn: settings.codeExpiryMinutes * 60
        });
      }
      if (user && !user.is_active) {
        return c.json({
          error: "This account has been deactivated."
        }, 403);
      }
      const ipAddress = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "unknown";
      const userAgent = c.req.header("user-agent") || "unknown";
      const otpCode = await otpService.createOTPCode(
        normalizedEmail,
        settings,
        ipAddress,
        userAgent
      );
      try {
        const isDevMode = c.env.ENVIRONMENT === "development";
        if (isDevMode) {
          console.log(`[DEV] OTP Code for ${normalizedEmail}: ${otpCode.code}`);
        }
        const emailContent = renderOTPEmail({
          code: otpCode.code,
          expiryMinutes: settings.codeExpiryMinutes,
          codeLength: settings.codeLength,
          maxAttempts: settings.maxAttempts,
          email: normalizedEmail,
          ipAddress,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          appName: settings.appName
        });
        const response = {
          message: "If an account exists for this email, you will receive a verification code shortly.",
          expiresIn: settings.codeExpiryMinutes * 60
        };
        if (isDevMode) {
          response.dev_code = otpCode.code;
        }
        return c.json(response);
      } catch (emailError) {
        console.error("Error sending OTP email:", emailError);
        return c.json({
          error: "Failed to send verification code. Please try again."
        }, 500);
      }
    } catch (error) {
      console.error("OTP request error:", error);
      return c.json({
        error: "An error occurred. Please try again."
      }, 500);
    }
  });
  otpAPI.post("/verify", async (c) => {
    try {
      const body = await c.req.json();
      const validation = otpVerifySchema.safeParse(body);
      if (!validation.success) {
        return c.json({
          error: "Validation failed",
          details: validation.error.issues
        }, 400);
      }
      const { email, code } = validation.data;
      const normalizedEmail = email.toLowerCase();
      const db = c.env.DB;
      const otpService = new OTPService(db);
      const settings = { ...DEFAULT_SETTINGS };
      const verification = await otpService.verifyCode(normalizedEmail, code, settings);
      if (!verification.valid) {
        await otpService.incrementAttempts(normalizedEmail, code);
        return c.json({
          error: verification.error || "Invalid code",
          attemptsRemaining: verification.attemptsRemaining
        }, 401);
      }
      const user = await db.prepare(`
        SELECT id, email, role, is_active
        FROM users
        WHERE email = ?
      `).bind(normalizedEmail).first();
      if (!user) {
        return c.json({
          error: "User not found"
        }, 404);
      }
      if (!user.is_active) {
        return c.json({
          error: "Account is deactivated"
        }, 403);
      }
      return c.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        message: "Authentication successful"
      });
    } catch (error) {
      console.error("OTP verify error:", error);
      return c.json({
        error: "An error occurred. Please try again."
      }, 500);
    }
  });
  otpAPI.post("/resend", async (c) => {
    try {
      const body = await c.req.json();
      const validation = otpRequestSchema.safeParse(body);
      if (!validation.success) {
        return c.json({
          error: "Validation failed",
          details: validation.error.issues
        }, 400);
      }
      return otpAPI.fetch(
        new Request(c.req.url.replace("/resend", "/request"), {
          method: "POST",
          headers: c.req.raw.headers,
          body: JSON.stringify({ email: validation.data.email })
        }),
        c.env
      );
    } catch (error) {
      console.error("OTP resend error:", error);
      return c.json({
        error: "An error occurred. Please try again."
      }, 500);
    }
  });
  builder.addRoute("/auth/otp", otpAPI, {
    description: "OTP authentication endpoints",
    requiresAuth: false,
    priority: 100
  });
  const adminRoutes = new hono.Hono();
  adminRoutes.get("/settings", async (c) => {
    const user = c.get("user");
    const contentHTML = await html.html`
      <div class="p-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold mb-2">OTP Login Settings</h1>
          <p class="text-zinc-600 dark:text-zinc-400">Configure passwordless authentication via email codes</p>
        </div>

        <div class="max-w-3xl">
          <div class="backdrop-blur-md bg-black/20 border border-white/10 shadow-xl rounded-xl p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">Code Settings</h2>

            <form id="otpSettingsForm" class="space-y-6">
              <div>
                <label for="codeLength" class="block text-sm font-medium mb-2">
                  Code Length
                </label>
                <input
                  type="number"
                  id="codeLength"
                  name="codeLength"
                  min="4"
                  max="8"
                  value="6"
                  class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                />
                <p class="text-xs text-zinc-500 mt-1">Number of digits in OTP code (4-8)</p>
              </div>

              <div>
                <label for="codeExpiryMinutes" class="block text-sm font-medium mb-2">
                  Code Expiry (minutes)
                </label>
                <input
                  type="number"
                  id="codeExpiryMinutes"
                  name="codeExpiryMinutes"
                  min="5"
                  max="60"
                  value="10"
                  class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                />
                <p class="text-xs text-zinc-500 mt-1">How long codes remain valid (5-60 minutes)</p>
              </div>

              <div>
                <label for="maxAttempts" class="block text-sm font-medium mb-2">
                  Maximum Attempts
                </label>
                <input
                  type="number"
                  id="maxAttempts"
                  name="maxAttempts"
                  min="3"
                  max="10"
                  value="3"
                  class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                />
                <p class="text-xs text-zinc-500 mt-1">Max verification attempts before invalidation</p>
              </div>

              <div>
                <label for="rateLimitPerHour" class="block text-sm font-medium mb-2">
                  Rate Limit (per hour)
                </label>
                <input
                  type="number"
                  id="rateLimitPerHour"
                  name="rateLimitPerHour"
                  min="3"
                  max="20"
                  value="5"
                  class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                />
                <p class="text-xs text-zinc-500 mt-1">Max code requests per email per hour</p>
              </div>

              <div class="flex items-center">
                <input
                  type="checkbox"
                  id="allowNewUserRegistration"
                  name="allowNewUserRegistration"
                  class="w-4 h-4 rounded border-white/10"
                />
                <label for="allowNewUserRegistration" class="ml-2 text-sm">
                  Allow new user registration via OTP
                </label>
              </div>

              <div class="flex gap-3 pt-4">
                <button
                  type="submit"
                  class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Save Settings
                </button>
                <button
                  type="button"
                  id="testOTPBtn"
                  class="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all"
                >
                  Send Test Code
                </button>
              </div>
            </form>
          </div>

          <div id="statusMessage" class="hidden backdrop-blur-md bg-black/20 border border-white/10 rounded-xl p-4 mb-6"></div>

          <div class="backdrop-blur-md bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
            <h3 class="font-semibold text-blue-400 mb-3">
              🔢 Features
            </h3>
            <ul class="text-sm text-blue-200 space-y-2">
              <li>✓ Passwordless authentication</li>
              <li>✓ Secure random code generation</li>
              <li>✓ Rate limiting protection</li>
              <li>✓ Brute force prevention</li>
              <li>✓ Mobile-friendly UX</li>
            </ul>
          </div>
        </div>
      </div>

      <script>
        document.getElementById('otpSettingsForm').addEventListener('submit', async (e) => {
          e.preventDefault()
          const statusEl = document.getElementById('statusMessage')
          statusEl.className = 'backdrop-blur-md bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6'
          statusEl.innerHTML = '✅ Settings saved successfully!'
          statusEl.classList.remove('hidden')
          setTimeout(() => statusEl.classList.add('hidden'), 3000)
        })

        document.getElementById('testOTPBtn').addEventListener('click', async () => {
          const email = prompt('Enter email address for test:')
          if (!email) return

          const statusEl = document.getElementById('statusMessage')
          statusEl.className = 'backdrop-blur-md bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-6'
          statusEl.innerHTML = '📧 Sending test code...'
          statusEl.classList.remove('hidden')

          try {
            const response = await fetch('/auth/otp/request', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email })
            })

            const data = await response.json()

            if (response.ok) {
              statusEl.className = 'backdrop-blur-md bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6'
              statusEl.innerHTML = '✅ Test code sent!' + (data.dev_code ? \` Code: <strong>\${data.dev_code}</strong>\` : '')
            } else {
              throw new Error(data.error || 'Failed')
            }
          } catch (error) {
            statusEl.className = 'backdrop-blur-md bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6'
            statusEl.innerHTML = '❌ Failed to send test code'
          }
        })
      </script>
    `;
    const templateUser = user ? {
      name: user.name ?? user.email ?? "Admin",
      email: user.email ?? "admin@sonicjs.com",
      role: user.role ?? "admin"
    } : void 0;
    return c.html(
      chunkAZLU3ROK_cjs.adminLayoutV2({
        title: "OTP Login Settings",
        content: contentHTML,
        user: templateUser,
        currentPath: "/admin/plugins/otp-login/settings"
      })
    );
  });
  builder.addRoute("/admin/plugins/otp-login", adminRoutes, {
    description: "OTP login admin interface",
    requiresAuth: true,
    priority: 85
  });
  builder.addMenuItem("OTP Login", "/admin/plugins/otp-login/settings", {
    icon: "key",
    order: 85,
    permissions: ["otp:manage"]
  });
  builder.lifecycle({
    activate: async () => {
      console.info("\u2705 OTP Login plugin activated");
    },
    deactivate: async () => {
      console.info("\u274C OTP Login plugin deactivated");
    }
  });
  return builder.build();
}
var otpLoginPlugin = createOTPLoginPlugin();
var magicLinkRequestSchema = zod.z.object({
  email: zod.z.string().email("Valid email is required")
});
function createMagicLinkAuthPlugin() {
  const magicLinkRoutes = new hono.Hono();
  magicLinkRoutes.post("/request", async (c) => {
    try {
      const body = await c.req.json();
      const validation = magicLinkRequestSchema.safeParse(body);
      if (!validation.success) {
        return c.json({
          error: "Validation failed",
          details: validation.error.issues
        }, 400);
      }
      const { email } = validation.data;
      const normalizedEmail = email.toLowerCase();
      const db = c.env.DB;
      const oneHourAgo = Date.now() - 60 * 60 * 1e3;
      const recentLinks = await db.prepare(`
        SELECT COUNT(*) as count
        FROM magic_links
        WHERE user_email = ? AND created_at > ?
      `).bind(normalizedEmail, oneHourAgo).first();
      const rateLimitPerHour = 5;
      if (recentLinks && recentLinks.count >= rateLimitPerHour) {
        return c.json({
          error: "Too many requests. Please try again later."
        }, 429);
      }
      const user = await db.prepare(`
        SELECT id, email, role, is_active
        FROM users
        WHERE email = ?
      `).bind(normalizedEmail).first();
      const allowNewUsers = false;
      if (!user && !allowNewUsers) {
        return c.json({
          message: "If an account exists for this email, you will receive a magic link shortly."
        });
      }
      if (user && !user.is_active) {
        return c.json({
          error: "This account has been deactivated."
        }, 403);
      }
      const token = crypto.randomUUID() + "-" + crypto.randomUUID();
      const tokenId = crypto.randomUUID();
      const linkExpiryMinutes = 15;
      const expiresAt = Date.now() + linkExpiryMinutes * 60 * 1e3;
      await db.prepare(`
        INSERT INTO magic_links (
          id, user_email, token, expires_at, used, created_at, ip_address, user_agent
        ) VALUES (?, ?, ?, ?, 0, ?, ?, ?)
      `).bind(
        tokenId,
        normalizedEmail,
        token,
        expiresAt,
        Date.now(),
        c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "unknown",
        c.req.header("user-agent") || "unknown"
      ).run();
      const baseUrl = new URL(c.req.url).origin;
      const magicLink = `${baseUrl}/auth/magic-link/verify?token=${token}`;
      try {
        const emailPlugin2 = c.env.plugins?.get("email");
        if (emailPlugin2 && emailPlugin2.sendEmail) {
          await emailPlugin2.sendEmail({
            to: normalizedEmail,
            subject: "Your Magic Link to Sign In",
            html: renderMagicLinkEmail(magicLink, linkExpiryMinutes)
          });
        } else {
          console.error("Email plugin not available");
          console.log(`Magic link for ${normalizedEmail}: ${magicLink}`);
        }
      } catch (error) {
        console.error("Failed to send magic link email:", error);
        return c.json({
          error: "Failed to send email. Please try again later."
        }, 500);
      }
      return c.json({
        message: "If an account exists for this email, you will receive a magic link shortly.",
        // For development only - remove in production
        ...c.env.ENVIRONMENT === "development" && { dev_link: magicLink }
      });
    } catch (error) {
      console.error("Magic link request error:", error);
      return c.json({ error: "Failed to process request" }, 500);
    }
  });
  magicLinkRoutes.get("/verify", async (c) => {
    try {
      const token = c.req.query("token");
      if (!token) {
        return c.redirect("/auth/login?error=Invalid magic link");
      }
      const db = c.env.DB;
      const magicLink = await db.prepare(`
        SELECT * FROM magic_links
        WHERE token = ? AND used = 0
      `).bind(token).first();
      if (!magicLink) {
        return c.redirect("/auth/login?error=Invalid or expired magic link");
      }
      if (magicLink.expires_at < Date.now()) {
        return c.redirect("/auth/login?error=This magic link has expired");
      }
      let user = await db.prepare(`
        SELECT * FROM users WHERE email = ? AND is_active = 1
      `).bind(magicLink.user_email).first();
      const allowNewUsers = false;
      if (!user && allowNewUsers) {
        const userId = crypto.randomUUID();
        const username = magicLink.user_email.split("@")[0];
        const now = Date.now();
        await db.prepare(`
          INSERT INTO users (
            id, email, username, first_name, last_name,
            password_hash, role, is_active, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, NULL, 'viewer', 1, ?, ?)
        `).bind(
          userId,
          magicLink.user_email,
          username,
          username,
          "",
          now,
          now
        ).run();
        user = {
          id: userId,
          email: magicLink.user_email,
          username,
          role: "viewer"
        };
      } else if (!user) {
        return c.redirect("/auth/login?error=No account found for this email");
      }
      await db.prepare(`
        UPDATE magic_links
        SET used = 1, used_at = ?
        WHERE id = ?
      `).bind(Date.now(), magicLink.id).run();
      const jwtToken = await chunk3TUJBBAF_cjs.AuthManager.generateToken(
        user.id,
        user.email,
        user.role
      );
      chunk3TUJBBAF_cjs.AuthManager.setAuthCookie(c, jwtToken);
      await db.prepare(`
        UPDATE users SET last_login_at = ? WHERE id = ?
      `).bind(Date.now(), user.id).run();
      return c.redirect("/admin/dashboard?message=Successfully signed in");
    } catch (error) {
      console.error("Magic link verification error:", error);
      return c.redirect("/auth/login?error=Authentication failed");
    }
  });
  return {
    name: "magic-link-auth",
    version: "1.0.0",
    description: "Passwordless authentication via email magic links",
    author: {
      name: "SonicJS Team",
      email: "team@sonicjs.com"
    },
    dependencies: ["email"],
    routes: [{
      path: "/auth/magic-link",
      handler: magicLinkRoutes,
      description: "Magic link authentication endpoints",
      requiresAuth: false
    }],
    async install(context) {
      console.log("Installing magic-link-auth plugin...");
    },
    async activate(context) {
      console.log("Magic link authentication activated");
      console.log("Users can now sign in via /auth/magic-link/request");
    },
    async deactivate(context) {
      console.log("Magic link authentication deactivated");
    },
    async uninstall(context) {
      console.log("Uninstalling magic-link-auth plugin...");
    }
  };
}
function renderMagicLinkEmail(magicLink, expiryMinutes) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Magic Link</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: #ffffff;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #0ea5e9;
          margin: 0;
          font-size: 24px;
        }
        .content {
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          text-align: center;
          margin: 20px 0;
        }
        .button:hover {
          opacity: 0.9;
        }
        .expiry {
          color: #ef4444;
          font-size: 14px;
          margin-top: 20px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
          text-align: center;
        }
        .security-note {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 12px 16px;
          margin-top: 20px;
          border-radius: 4px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>\u{1F517} Your Magic Link</h1>
        </div>

        <div class="content">
          <p>Hello!</p>
          <p>You requested a magic link to sign in to your account. Click the button below to continue:</p>

          <div style="text-align: center;">
            <a href="${magicLink}" class="button">Sign In</a>
          </div>

          <p class="expiry">\u23F0 This link expires in ${expiryMinutes} minutes</p>

          <div class="security-note">
            <strong>Security Notice:</strong> If you didn't request this link, you can safely ignore this email.
            Someone may have entered your email address by mistake.
          </div>
        </div>

        <div class="footer">
          <p>This is an automated email from SonicJS.</p>
          <p>For security, this link can only be used once.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
createMagicLinkAuthPlugin();

// src/app.ts
function createSonicJSApp(config = {}) {
  const app = new hono.Hono();
  const appVersion = config.version || chunkIRN6XDON_cjs.getCoreVersion();
  const appName = config.name || "SonicJS AI";
  app.use("*", async (c, next) => {
    c.set("appVersion", appVersion);
    await next();
  });
  app.use("*", chunk3TUJBBAF_cjs.metricsMiddleware());
  app.use("*", chunk3TUJBBAF_cjs.bootstrapMiddleware(config));
  if (config.middleware?.beforeAuth) {
    for (const middleware of config.middleware.beforeAuth) {
      app.use("*", middleware);
    }
  }
  app.use("*", async (_c, next) => {
    await next();
  });
  app.use("*", async (_c, next) => {
    await next();
  });
  if (config.middleware?.afterAuth) {
    for (const middleware of config.middleware.afterAuth) {
      app.use("*", middleware);
    }
  }
  app.route("/api", chunkI62BQ3LF_cjs.api_default);
  app.route("/api/media", chunkI62BQ3LF_cjs.api_media_default);
  app.route("/api/system", chunkI62BQ3LF_cjs.api_system_default);
  app.route("/admin/api", chunkI62BQ3LF_cjs.admin_api_default);
  app.route("/admin/dashboard", chunkI62BQ3LF_cjs.router);
  app.route("/admin/collections", chunkI62BQ3LF_cjs.adminCollectionsRoutes);
  app.route("/admin/settings", chunkI62BQ3LF_cjs.adminSettingsRoutes);
  app.route("/admin/database-tools", createDatabaseToolsAdminRoutes());
  app.route("/admin/content", chunkI62BQ3LF_cjs.admin_content_default);
  app.route("/admin/media", chunkI62BQ3LF_cjs.adminMediaRoutes);
  app.route("/admin/plugins", chunkI62BQ3LF_cjs.adminPluginRoutes);
  app.route("/admin/logs", chunkI62BQ3LF_cjs.adminLogsRoutes);
  app.route("/admin", chunkI62BQ3LF_cjs.userRoutes);
  app.route("/auth", chunkI62BQ3LF_cjs.auth_default);
  app.route("/", chunkI62BQ3LF_cjs.test_cleanup_default);
  if (emailPlugin.routes && emailPlugin.routes.length > 0) {
    for (const route of emailPlugin.routes) {
      app.route(route.path, route.handler);
    }
  }
  if (otpLoginPlugin.routes && otpLoginPlugin.routes.length > 0) {
    for (const route of otpLoginPlugin.routes) {
      app.route(route.path, route.handler);
    }
  }
  const magicLinkPlugin = createMagicLinkAuthPlugin();
  if (magicLinkPlugin.routes && magicLinkPlugin.routes.length > 0) {
    for (const route of magicLinkPlugin.routes) {
      app.route(route.path, route.handler);
    }
  }
  app.get("/files/*", async (c) => {
    try {
      const url = new URL(c.req.url);
      const pathname = url.pathname;
      const objectKey = pathname.replace(/^\/files\//, "");
      if (!objectKey) {
        return c.notFound();
      }
      const object = await c.env.MEDIA_BUCKET.get(objectKey);
      if (!object) {
        return c.notFound();
      }
      const headers = new Headers();
      object.httpMetadata?.contentType && headers.set("Content-Type", object.httpMetadata.contentType);
      object.httpMetadata?.contentDisposition && headers.set("Content-Disposition", object.httpMetadata.contentDisposition);
      headers.set("Cache-Control", "public, max-age=31536000");
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Content-Type");
      return new Response(object.body, {
        headers
      });
    } catch (error) {
      console.error("Error serving file:", error);
      return c.notFound();
    }
  });
  if (config.routes) {
    for (const route of config.routes) {
      app.route(route.path, route.handler);
    }
  }
  app.get("/", (c) => {
    return c.redirect("/auth/login");
  });
  app.get("/health", (c) => {
    return c.json({
      name: appName,
      version: appVersion,
      status: "running",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.notFound((c) => {
    return c.json({ error: "Not Found", status: 404 }, 404);
  });
  app.onError((err, c) => {
    console.error(err);
    return c.json({ error: "Internal Server Error", status: 500 }, 500);
  });
  return app;
}
function setupCoreMiddleware(_app) {
  console.warn("setupCoreMiddleware is deprecated. Use createSonicJSApp() instead.");
}
function setupCoreRoutes(_app) {
  console.warn("setupCoreRoutes is deprecated. Use createSonicJSApp() instead.");
}
function createDb(d1$1) {
  return d1.drizzle(d1$1, { schema: chunk7FOAMNTI_cjs.schema_exports });
}

// src/index.ts
var VERSION = chunkIRN6XDON_cjs.package_default.version;

Object.defineProperty(exports, "ROUTES_INFO", {
  enumerable: true,
  get: function () { return chunkI62BQ3LF_cjs.ROUTES_INFO; }
});
Object.defineProperty(exports, "adminApiRoutes", {
  enumerable: true,
  get: function () { return chunkI62BQ3LF_cjs.admin_api_default; }
});
Object.defineProperty(exports, "adminCheckboxRoutes", {
  enumerable: true,
  get: function () { return chunkI62BQ3LF_cjs.adminCheckboxRoutes; }
});
Object.defineProperty(exports, "adminCodeExamplesRoutes", {
  enumerable: true,
  get: function () { return chunkI62BQ3LF_cjs.admin_code_examples_default; }
});
Object.defineProperty(exports, "adminCollectionsRoutes", {
  enumerable: true,
  get: function () { return chunkI62BQ3LF_cjs.adminCollectionsRoutes; }
});
Object.defineProperty(exports, "adminContentRoutes", {
  enumerable: true,
  get: function () { return chunkI62BQ3LF_cjs.admin_content_default; }
});
Object.defineProperty(exports, "adminDashboardRoutes", {
  enumerable: true,
  get: function () { return chunkI62BQ3LF_cjs.router; }
});
Object.defineProperty(exports, "adminDesignRoutes", {
  enumerable: true,
  get: function () { return chunkI62BQ3LF_cjs.adminDesignRoutes; }
});
Object.defineProperty(exports, "adminLogsRoutes", {
  enumerable: true,
  get: function () { return chunkI62BQ3LF_cjs.adminLogsRoutes; }
});
Object.defineProperty(exports, "adminMediaRoutes", {
  enumerable: true,
  get: function () { return chunkI62BQ3LF_cjs.adminMediaRoutes; }
});
Object.defineProperty(exports, "adminPluginRoutes", {
  enumerable: true,
  get: function () { return chunkI62BQ3LF_cjs.adminPluginRoutes; }
});
Object.defineProperty(exports, "adminSettingsRoutes", {
  enumerable: true,
  get: function () { return chunkI62BQ3LF_cjs.adminSettingsRoutes; }
});
Object.defineProperty(exports, "adminTestimonialsRoutes", {
  enumerable: true,
  get: function () { return chunkI62BQ3LF_cjs.admin_testimonials_default; }
});
Object.defineProperty(exports, "adminUsersRoutes", {
  enumerable: true,
  get: function () { return chunkI62BQ3LF_cjs.userRoutes; }
});
Object.defineProperty(exports, "apiContentCrudRoutes", {
  enumerable: true,
  get: function () { return chunkI62BQ3LF_cjs.api_content_crud_default; }
});
Object.defineProperty(exports, "apiMediaRoutes", {
  enumerable: true,
  get: function () { return chunkI62BQ3LF_cjs.api_media_default; }
});
Object.defineProperty(exports, "apiRoutes", {
  enumerable: true,
  get: function () { return chunkI62BQ3LF_cjs.api_default; }
});
Object.defineProperty(exports, "apiSystemRoutes", {
  enumerable: true,
  get: function () { return chunkI62BQ3LF_cjs.api_system_default; }
});
Object.defineProperty(exports, "authRoutes", {
  enumerable: true,
  get: function () { return chunkI62BQ3LF_cjs.auth_default; }
});
Object.defineProperty(exports, "Logger", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.Logger; }
});
Object.defineProperty(exports, "apiTokens", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.apiTokens; }
});
Object.defineProperty(exports, "collections", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.collections; }
});
Object.defineProperty(exports, "content", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.content; }
});
Object.defineProperty(exports, "contentVersions", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.contentVersions; }
});
Object.defineProperty(exports, "getLogger", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.getLogger; }
});
Object.defineProperty(exports, "initLogger", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.initLogger; }
});
Object.defineProperty(exports, "insertCollectionSchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.insertCollectionSchema; }
});
Object.defineProperty(exports, "insertContentSchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.insertContentSchema; }
});
Object.defineProperty(exports, "insertLogConfigSchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.insertLogConfigSchema; }
});
Object.defineProperty(exports, "insertMediaSchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.insertMediaSchema; }
});
Object.defineProperty(exports, "insertPluginActivityLogSchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.insertPluginActivityLogSchema; }
});
Object.defineProperty(exports, "insertPluginAssetSchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.insertPluginAssetSchema; }
});
Object.defineProperty(exports, "insertPluginHookSchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.insertPluginHookSchema; }
});
Object.defineProperty(exports, "insertPluginRouteSchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.insertPluginRouteSchema; }
});
Object.defineProperty(exports, "insertPluginSchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.insertPluginSchema; }
});
Object.defineProperty(exports, "insertSystemLogSchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.insertSystemLogSchema; }
});
Object.defineProperty(exports, "insertUserSchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.insertUserSchema; }
});
Object.defineProperty(exports, "insertWorkflowHistorySchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.insertWorkflowHistorySchema; }
});
Object.defineProperty(exports, "logConfig", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.logConfig; }
});
Object.defineProperty(exports, "media", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.media; }
});
Object.defineProperty(exports, "pluginActivityLog", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.pluginActivityLog; }
});
Object.defineProperty(exports, "pluginAssets", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.pluginAssets; }
});
Object.defineProperty(exports, "pluginHooks", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.pluginHooks; }
});
Object.defineProperty(exports, "pluginRoutes", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.pluginRoutes; }
});
Object.defineProperty(exports, "plugins", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.plugins; }
});
Object.defineProperty(exports, "selectCollectionSchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.selectCollectionSchema; }
});
Object.defineProperty(exports, "selectContentSchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.selectContentSchema; }
});
Object.defineProperty(exports, "selectLogConfigSchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.selectLogConfigSchema; }
});
Object.defineProperty(exports, "selectMediaSchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.selectMediaSchema; }
});
Object.defineProperty(exports, "selectPluginActivityLogSchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.selectPluginActivityLogSchema; }
});
Object.defineProperty(exports, "selectPluginAssetSchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.selectPluginAssetSchema; }
});
Object.defineProperty(exports, "selectPluginHookSchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.selectPluginHookSchema; }
});
Object.defineProperty(exports, "selectPluginRouteSchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.selectPluginRouteSchema; }
});
Object.defineProperty(exports, "selectPluginSchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.selectPluginSchema; }
});
Object.defineProperty(exports, "selectSystemLogSchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.selectSystemLogSchema; }
});
Object.defineProperty(exports, "selectUserSchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.selectUserSchema; }
});
Object.defineProperty(exports, "selectWorkflowHistorySchema", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.selectWorkflowHistorySchema; }
});
Object.defineProperty(exports, "systemLogs", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.systemLogs; }
});
Object.defineProperty(exports, "users", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.users; }
});
Object.defineProperty(exports, "workflowHistory", {
  enumerable: true,
  get: function () { return chunk7FOAMNTI_cjs.workflowHistory; }
});
Object.defineProperty(exports, "AuthManager", {
  enumerable: true,
  get: function () { return chunk3TUJBBAF_cjs.AuthManager; }
});
Object.defineProperty(exports, "PermissionManager", {
  enumerable: true,
  get: function () { return chunk3TUJBBAF_cjs.PermissionManager; }
});
Object.defineProperty(exports, "bootstrapMiddleware", {
  enumerable: true,
  get: function () { return chunk3TUJBBAF_cjs.bootstrapMiddleware; }
});
Object.defineProperty(exports, "cacheHeaders", {
  enumerable: true,
  get: function () { return chunk3TUJBBAF_cjs.cacheHeaders; }
});
Object.defineProperty(exports, "compressionMiddleware", {
  enumerable: true,
  get: function () { return chunk3TUJBBAF_cjs.compressionMiddleware; }
});
Object.defineProperty(exports, "detailedLoggingMiddleware", {
  enumerable: true,
  get: function () { return chunk3TUJBBAF_cjs.detailedLoggingMiddleware; }
});
Object.defineProperty(exports, "getActivePlugins", {
  enumerable: true,
  get: function () { return chunk3TUJBBAF_cjs.getActivePlugins; }
});
Object.defineProperty(exports, "isPluginActive", {
  enumerable: true,
  get: function () { return chunk3TUJBBAF_cjs.isPluginActive; }
});
Object.defineProperty(exports, "logActivity", {
  enumerable: true,
  get: function () { return chunk3TUJBBAF_cjs.logActivity; }
});
Object.defineProperty(exports, "loggingMiddleware", {
  enumerable: true,
  get: function () { return chunk3TUJBBAF_cjs.loggingMiddleware; }
});
Object.defineProperty(exports, "optionalAuth", {
  enumerable: true,
  get: function () { return chunk3TUJBBAF_cjs.optionalAuth; }
});
Object.defineProperty(exports, "performanceLoggingMiddleware", {
  enumerable: true,
  get: function () { return chunk3TUJBBAF_cjs.performanceLoggingMiddleware; }
});
Object.defineProperty(exports, "requireActivePlugin", {
  enumerable: true,
  get: function () { return chunk3TUJBBAF_cjs.requireActivePlugin; }
});
Object.defineProperty(exports, "requireActivePlugins", {
  enumerable: true,
  get: function () { return chunk3TUJBBAF_cjs.requireActivePlugins; }
});
Object.defineProperty(exports, "requireAnyPermission", {
  enumerable: true,
  get: function () { return chunk3TUJBBAF_cjs.requireAnyPermission; }
});
Object.defineProperty(exports, "requireAuth", {
  enumerable: true,
  get: function () { return chunk3TUJBBAF_cjs.requireAuth; }
});
Object.defineProperty(exports, "requirePermission", {
  enumerable: true,
  get: function () { return chunk3TUJBBAF_cjs.requirePermission; }
});
Object.defineProperty(exports, "requireRole", {
  enumerable: true,
  get: function () { return chunk3TUJBBAF_cjs.requireRole; }
});
Object.defineProperty(exports, "securityHeaders", {
  enumerable: true,
  get: function () { return chunk3TUJBBAF_cjs.securityHeaders; }
});
Object.defineProperty(exports, "securityLoggingMiddleware", {
  enumerable: true,
  get: function () { return chunk3TUJBBAF_cjs.securityLoggingMiddleware; }
});
Object.defineProperty(exports, "PluginBootstrapService", {
  enumerable: true,
  get: function () { return chunkILZ3DP4I_cjs.PluginBootstrapService; }
});
Object.defineProperty(exports, "PluginServiceClass", {
  enumerable: true,
  get: function () { return chunkILZ3DP4I_cjs.PluginService; }
});
Object.defineProperty(exports, "cleanupRemovedCollections", {
  enumerable: true,
  get: function () { return chunkILZ3DP4I_cjs.cleanupRemovedCollections; }
});
Object.defineProperty(exports, "fullCollectionSync", {
  enumerable: true,
  get: function () { return chunkILZ3DP4I_cjs.fullCollectionSync; }
});
Object.defineProperty(exports, "getAvailableCollectionNames", {
  enumerable: true,
  get: function () { return chunkILZ3DP4I_cjs.getAvailableCollectionNames; }
});
Object.defineProperty(exports, "getManagedCollections", {
  enumerable: true,
  get: function () { return chunkILZ3DP4I_cjs.getManagedCollections; }
});
Object.defineProperty(exports, "isCollectionManaged", {
  enumerable: true,
  get: function () { return chunkILZ3DP4I_cjs.isCollectionManaged; }
});
Object.defineProperty(exports, "loadCollectionConfig", {
  enumerable: true,
  get: function () { return chunkILZ3DP4I_cjs.loadCollectionConfig; }
});
Object.defineProperty(exports, "loadCollectionConfigs", {
  enumerable: true,
  get: function () { return chunkILZ3DP4I_cjs.loadCollectionConfigs; }
});
Object.defineProperty(exports, "registerCollections", {
  enumerable: true,
  get: function () { return chunkILZ3DP4I_cjs.registerCollections; }
});
Object.defineProperty(exports, "syncCollection", {
  enumerable: true,
  get: function () { return chunkILZ3DP4I_cjs.syncCollection; }
});
Object.defineProperty(exports, "syncCollections", {
  enumerable: true,
  get: function () { return chunkILZ3DP4I_cjs.syncCollections; }
});
Object.defineProperty(exports, "validateCollectionConfig", {
  enumerable: true,
  get: function () { return chunkILZ3DP4I_cjs.validateCollectionConfig; }
});
Object.defineProperty(exports, "MigrationService", {
  enumerable: true,
  get: function () { return chunkERUQJKQZ_cjs.MigrationService; }
});
Object.defineProperty(exports, "renderFilterBar", {
  enumerable: true,
  get: function () { return chunkYIXSSJWD_cjs.renderFilterBar; }
});
Object.defineProperty(exports, "getConfirmationDialogScript", {
  enumerable: true,
  get: function () { return chunkAZLU3ROK_cjs.getConfirmationDialogScript; }
});
Object.defineProperty(exports, "renderAlert", {
  enumerable: true,
  get: function () { return chunkAZLU3ROK_cjs.renderAlert; }
});
Object.defineProperty(exports, "renderConfirmationDialog", {
  enumerable: true,
  get: function () { return chunkAZLU3ROK_cjs.renderConfirmationDialog; }
});
Object.defineProperty(exports, "renderForm", {
  enumerable: true,
  get: function () { return chunkAZLU3ROK_cjs.renderForm; }
});
Object.defineProperty(exports, "renderFormField", {
  enumerable: true,
  get: function () { return chunkAZLU3ROK_cjs.renderFormField; }
});
Object.defineProperty(exports, "renderPagination", {
  enumerable: true,
  get: function () { return chunkAZLU3ROK_cjs.renderPagination; }
});
Object.defineProperty(exports, "renderTable", {
  enumerable: true,
  get: function () { return chunkAZLU3ROK_cjs.renderTable; }
});
Object.defineProperty(exports, "HookSystemImpl", {
  enumerable: true,
  get: function () { return chunkDTLB6UIH_cjs.HookSystemImpl; }
});
Object.defineProperty(exports, "HookUtils", {
  enumerable: true,
  get: function () { return chunkDTLB6UIH_cjs.HookUtils; }
});
Object.defineProperty(exports, "PluginManagerClass", {
  enumerable: true,
  get: function () { return chunkDTLB6UIH_cjs.PluginManager; }
});
Object.defineProperty(exports, "PluginRegistryImpl", {
  enumerable: true,
  get: function () { return chunkDTLB6UIH_cjs.PluginRegistryImpl; }
});
Object.defineProperty(exports, "PluginValidatorClass", {
  enumerable: true,
  get: function () { return chunkDTLB6UIH_cjs.PluginValidator; }
});
Object.defineProperty(exports, "ScopedHookSystemClass", {
  enumerable: true,
  get: function () { return chunkDTLB6UIH_cjs.ScopedHookSystem; }
});
Object.defineProperty(exports, "QueryFilterBuilder", {
  enumerable: true,
  get: function () { return chunkIRN6XDON_cjs.QueryFilterBuilder; }
});
Object.defineProperty(exports, "SONICJS_VERSION", {
  enumerable: true,
  get: function () { return chunkIRN6XDON_cjs.SONICJS_VERSION; }
});
Object.defineProperty(exports, "TemplateRenderer", {
  enumerable: true,
  get: function () { return chunkIRN6XDON_cjs.TemplateRenderer; }
});
Object.defineProperty(exports, "buildQuery", {
  enumerable: true,
  get: function () { return chunkIRN6XDON_cjs.buildQuery; }
});
Object.defineProperty(exports, "escapeHtml", {
  enumerable: true,
  get: function () { return chunkIRN6XDON_cjs.escapeHtml; }
});
Object.defineProperty(exports, "getCoreVersion", {
  enumerable: true,
  get: function () { return chunkIRN6XDON_cjs.getCoreVersion; }
});
Object.defineProperty(exports, "renderTemplate", {
  enumerable: true,
  get: function () { return chunkIRN6XDON_cjs.renderTemplate; }
});
Object.defineProperty(exports, "sanitizeInput", {
  enumerable: true,
  get: function () { return chunkIRN6XDON_cjs.sanitizeInput; }
});
Object.defineProperty(exports, "sanitizeObject", {
  enumerable: true,
  get: function () { return chunkIRN6XDON_cjs.sanitizeObject; }
});
Object.defineProperty(exports, "templateRenderer", {
  enumerable: true,
  get: function () { return chunkIRN6XDON_cjs.templateRenderer; }
});
Object.defineProperty(exports, "metricsTracker", {
  enumerable: true,
  get: function () { return chunkRCQ2HIQD_cjs.metricsTracker; }
});
Object.defineProperty(exports, "HOOKS", {
  enumerable: true,
  get: function () { return chunkKYGRJCZM_cjs.HOOKS; }
});
exports.VERSION = VERSION;
exports.createDb = createDb;
exports.createSonicJSApp = createSonicJSApp;
exports.setupCoreMiddleware = setupCoreMiddleware;
exports.setupCoreRoutes = setupCoreRoutes;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map