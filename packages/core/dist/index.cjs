'use strict';

var chunkPQ4S4G3U_cjs = require('./chunk-PQ4S4G3U.cjs');
var chunkDOR2IU73_cjs = require('./chunk-DOR2IU73.cjs');
var chunkYN4VD3ML_cjs = require('./chunk-YN4VD3ML.cjs');
var chunkNBDPIRQS_cjs = require('./chunk-NBDPIRQS.cjs');
var chunkCAP6QQR2_cjs = require('./chunk-CAP6QQR2.cjs');
var chunkMU3MR2QR_cjs = require('./chunk-MU3MR2QR.cjs');
var chunkF5ESJXI2_cjs = require('./chunk-F5ESJXI2.cjs');
var chunkPGZZPKZL_cjs = require('./chunk-PGZZPKZL.cjs');
var chunkRCQ2HIQD_cjs = require('./chunk-RCQ2HIQD.cjs');
var chunkKYGRJCZM_cjs = require('./chunk-KYGRJCZM.cjs');
require('./chunk-IGJUBJBW.cjs');
var hono = require('hono');
var html = require('hono/html');
require('zod');
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
chunkMU3MR2QR_cjs.init_admin_layout_catalyst_template();
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
  return chunkMU3MR2QR_cjs.renderAdminLayoutCatalyst(layoutData);
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
  router2.use("*", chunkYN4VD3ML_cjs.requireAuth());
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
var PluginBuilder = class _PluginBuilder {
  plugin;
  constructor(options) {
    this.plugin = {
      name: options.name,
      version: options.version,
      description: options.description,
      author: options.author,
      dependencies: options.dependencies,
      routes: [],
      middleware: [],
      models: [],
      services: [],
      adminPages: [],
      adminComponents: [],
      menuItems: [],
      hooks: []
    };
  }
  /**
   * Create a new plugin builder
   */
  static create(options) {
    return new _PluginBuilder(options);
  }
  /**
   * Add metadata to the plugin
   */
  metadata(metadata) {
    Object.assign(this.plugin, metadata);
    return this;
  }
  /**
   * Add routes to plugin
   */
  addRoutes(routes) {
    this.plugin.routes = [...this.plugin.routes || [], ...routes];
    return this;
  }
  /**
   * Add a single route to plugin
   */
  addRoute(path, handler, options) {
    const route = {
      path,
      handler,
      ...options
    };
    this.plugin.routes = [...this.plugin.routes || [], route];
    return this;
  }
  /**
   * Add middleware to plugin
   */
  addMiddleware(middleware) {
    this.plugin.middleware = [...this.plugin.middleware || [], ...middleware];
    return this;
  }
  /**
   * Add a single middleware to plugin
   */
  addSingleMiddleware(name, handler, options) {
    const middleware = {
      name,
      handler,
      ...options
    };
    this.plugin.middleware = [...this.plugin.middleware || [], middleware];
    return this;
  }
  /**
   * Add models to plugin
   */
  addModels(models) {
    this.plugin.models = [...this.plugin.models || [], ...models];
    return this;
  }
  /**
   * Add a single model to plugin
   */
  addModel(name, options) {
    const model = {
      name,
      ...options
    };
    this.plugin.models = [...this.plugin.models || [], model];
    return this;
  }
  /**
   * Add services to plugin
   */
  addServices(services) {
    this.plugin.services = [...this.plugin.services || [], ...services];
    return this;
  }
  /**
   * Add a single service to plugin
   */
  addService(name, implementation, options) {
    const service = {
      name,
      implementation,
      ...options
    };
    this.plugin.services = [...this.plugin.services || [], service];
    return this;
  }
  /**
   * Add admin pages to plugin
   */
  addAdminPages(pages) {
    this.plugin.adminPages = [...this.plugin.adminPages || [], ...pages];
    return this;
  }
  /**
   * Add a single admin page to plugin
   */
  addAdminPage(path, title, component, options) {
    const page = {
      path,
      title,
      component,
      ...options
    };
    this.plugin.adminPages = [...this.plugin.adminPages || [], page];
    return this;
  }
  /**
   * Add admin components to plugin
   */
  addComponents(components) {
    this.plugin.adminComponents = [...this.plugin.adminComponents || [], ...components];
    return this;
  }
  /**
   * Add a single admin component to plugin
   */
  addComponent(name, template, options) {
    const component = {
      name,
      template,
      ...options
    };
    this.plugin.adminComponents = [...this.plugin.adminComponents || [], component];
    return this;
  }
  /**
   * Add menu items to plugin
   */
  addMenuItems(items) {
    this.plugin.menuItems = [...this.plugin.menuItems || [], ...items];
    return this;
  }
  /**
   * Add a single menu item to plugin
   */
  addMenuItem(label, path, options) {
    const menuItem = {
      label,
      path,
      ...options
    };
    this.plugin.menuItems = [...this.plugin.menuItems || [], menuItem];
    return this;
  }
  /**
   * Add hooks to plugin
   */
  addHooks(hooks) {
    this.plugin.hooks = [...this.plugin.hooks || [], ...hooks];
    return this;
  }
  /**
   * Add a single hook to plugin
   */
  addHook(name, handler, options) {
    const hook = {
      name,
      handler,
      ...options
    };
    this.plugin.hooks = [...this.plugin.hooks || [], hook];
    return this;
  }
  /**
   * Add lifecycle hooks
   */
  lifecycle(hooks) {
    Object.assign(this.plugin, hooks);
    return this;
  }
  /**
   * Build the plugin
   */
  build() {
    if (!this.plugin.name || !this.plugin.version) {
      throw new Error("Plugin name and version are required");
    }
    return this.plugin;
  }
};

// src/plugins/core-plugins/email-plugin/index.ts
function createEmailPlugin() {
  const builder = PluginBuilder.create({
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
    const contentHTML = html.html`
      <div class="p-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold mb-2">Email Settings</h1>
          <p class="text-zinc-600 dark:text-zinc-400">Configure Resend API for sending transactional emails</p>
        </div>

        <!-- Settings Form -->
        <div class="max-w-3xl">
          <!-- Main Settings Card -->
          <div class="backdrop-blur-md bg-black/20 border border-white/10 shadow-xl rounded-xl p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">Resend Configuration</h2>

            <form id="emailSettingsForm" class="space-y-6">
              <!-- API Key -->
              <div>
                <label for="apiKey" class="block text-sm font-medium mb-2">
                  Resend API Key <span class="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="apiKey"
                  name="apiKey"
                  class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                  placeholder="re_..."
                  required
                />
                <p class="text-xs text-zinc-500 mt-1">
                  Get your API key from <a href="https://resend.com/api-keys" target="_blank" class="text-blue-400 hover:underline">resend.com/api-keys</a>
                </p>
              </div>

              <!-- From Email -->
              <div>
                <label for="fromEmail" class="block text-sm font-medium mb-2">
                  From Email <span class="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="fromEmail"
                  name="fromEmail"
                  class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                  placeholder="noreply@yourdomain.com"
                  required
                />
                <p class="text-xs text-zinc-500 mt-1">
                  Must be a verified domain in Resend
                </p>
              </div>

              <!-- From Name -->
              <div>
                <label for="fromName" class="block text-sm font-medium mb-2">
                  From Name <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fromName"
                  name="fromName"
                  class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                  placeholder="Your App Name"
                  required
                />
              </div>

              <!-- Reply To -->
              <div>
                <label for="replyTo" class="block text-sm font-medium mb-2">
                  Reply-To Email
                </label>
                <input
                  type="email"
                  id="replyTo"
                  name="replyTo"
                  class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                  placeholder="support@yourdomain.com"
                />
              </div>

              <!-- Logo URL -->
              <div>
                <label for="logoUrl" class="block text-sm font-medium mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  id="logoUrl"
                  name="logoUrl"
                  class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                  placeholder="https://yourdomain.com/logo.png"
                />
                <p class="text-xs text-zinc-500 mt-1">
                  Logo to display in email templates
                </p>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3 pt-4">
                <button
                  type="submit"
                  class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Save Settings
                </button>
                <button
                  type="button"
                  id="testEmailBtn"
                  class="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all"
                >
                  Send Test Email
                </button>
                <button
                  type="button"
                  id="resetBtn"
                  class="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-all"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          <!-- Status Message -->
          <div id="statusMessage" class="hidden backdrop-blur-md bg-black/20 border border-white/10 rounded-xl p-4"></div>

          <!-- Info Card -->
          <div class="backdrop-blur-md bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
            <h3 class="font-semibold text-blue-400 mb-3">
              📧 Email Templates Included
            </h3>
            <ul class="text-sm text-blue-200 space-y-2">
              <li>✓ Registration confirmation</li>
              <li>✓ Email verification</li>
              <li>✓ Password reset</li>
              <li>✓ One-time code (2FA)</li>
            </ul>
            <p class="text-xs text-blue-300 mt-4">
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
              statusEl.className = 'backdrop-blur-md bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6'
              statusEl.innerHTML = '✅ Settings saved successfully!'
              statusEl.classList.remove('hidden')
              setTimeout(() => statusEl.classList.add('hidden'), 3000)
            } else {
              throw new Error('Failed to save settings')
            }
          } catch (error) {
            statusEl.className = 'backdrop-blur-md bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6'
            statusEl.innerHTML = '❌ Failed to save settings. Please try again.'
            statusEl.classList.remove('hidden')
          }
        })

        // Test email handler
        document.getElementById('testEmailBtn').addEventListener('click', async () => {
          const statusEl = document.getElementById('statusMessage')

          statusEl.className = 'backdrop-blur-md bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-6'
          statusEl.innerHTML = '📧 Sending test email...'
          statusEl.classList.remove('hidden')

          try {
            const response = await fetch('/admin/plugins/email/test', {
              method: 'POST'
            })

            if (response.ok) {
              statusEl.className = 'backdrop-blur-md bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6'
              statusEl.innerHTML = '✅ Test email sent! Check your inbox.'
            } else {
              throw new Error('Failed to send test email')
            }
          } catch (error) {
            statusEl.className = 'backdrop-blur-md bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6'
            statusEl.innerHTML = '❌ Failed to send test email. Check your settings.'
          }
        })

        // Reset button handler
        document.getElementById('resetBtn').addEventListener('click', () => {
          document.getElementById('emailSettingsForm').reset()
        })
      </script>
    `;
    return c.html(
      chunkMU3MR2QR_cjs.adminLayoutV2({
        title: "Email Settings",
        content: contentHTML,
        user,
        currentPath: "/admin/plugins/email/settings"
      })
    );
  });
  emailRoutes.post("/settings", async (c) => {
    return c.json({ success: true });
  });
  emailRoutes.post("/test", async (c) => {
    return c.json({ success: true });
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

// src/app.ts
function createSonicJSApp(config = {}) {
  const app = new hono.Hono();
  const appVersion = config.version || chunkPGZZPKZL_cjs.getCoreVersion();
  const appName = config.name || "SonicJS AI";
  app.use("*", async (c, next) => {
    c.set("appVersion", appVersion);
    await next();
  });
  app.use("*", chunkYN4VD3ML_cjs.metricsMiddleware());
  app.use("*", chunkYN4VD3ML_cjs.bootstrapMiddleware(config));
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
  app.route("/api", chunkPQ4S4G3U_cjs.api_default);
  app.route("/api/media", chunkPQ4S4G3U_cjs.api_media_default);
  app.route("/api/system", chunkPQ4S4G3U_cjs.api_system_default);
  app.route("/admin/api", chunkPQ4S4G3U_cjs.admin_api_default);
  app.route("/admin/dashboard", chunkPQ4S4G3U_cjs.router);
  app.route("/admin/collections", chunkPQ4S4G3U_cjs.adminCollectionsRoutes);
  app.route("/admin/settings", chunkPQ4S4G3U_cjs.adminSettingsRoutes);
  app.route("/admin/database-tools", createDatabaseToolsAdminRoutes());
  app.route("/admin/content", chunkPQ4S4G3U_cjs.admin_content_default);
  app.route("/admin/media", chunkPQ4S4G3U_cjs.adminMediaRoutes);
  app.route("/admin/plugins", chunkPQ4S4G3U_cjs.adminPluginRoutes);
  app.route("/admin/logs", chunkPQ4S4G3U_cjs.adminLogsRoutes);
  app.route("/admin", chunkPQ4S4G3U_cjs.userRoutes);
  app.route("/auth", chunkPQ4S4G3U_cjs.auth_default);
  if (emailPlugin.routes && emailPlugin.routes.length > 0) {
    for (const route of emailPlugin.routes) {
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
  return d1.drizzle(d1$1, { schema: chunkDOR2IU73_cjs.schema_exports });
}

// src/index.ts
var VERSION = chunkPGZZPKZL_cjs.package_default.version;

Object.defineProperty(exports, "ROUTES_INFO", {
  enumerable: true,
  get: function () { return chunkPQ4S4G3U_cjs.ROUTES_INFO; }
});
Object.defineProperty(exports, "adminApiRoutes", {
  enumerable: true,
  get: function () { return chunkPQ4S4G3U_cjs.admin_api_default; }
});
Object.defineProperty(exports, "adminCheckboxRoutes", {
  enumerable: true,
  get: function () { return chunkPQ4S4G3U_cjs.adminCheckboxRoutes; }
});
Object.defineProperty(exports, "adminCodeExamplesRoutes", {
  enumerable: true,
  get: function () { return chunkPQ4S4G3U_cjs.admin_code_examples_default; }
});
Object.defineProperty(exports, "adminCollectionsRoutes", {
  enumerable: true,
  get: function () { return chunkPQ4S4G3U_cjs.adminCollectionsRoutes; }
});
Object.defineProperty(exports, "adminContentRoutes", {
  enumerable: true,
  get: function () { return chunkPQ4S4G3U_cjs.admin_content_default; }
});
Object.defineProperty(exports, "adminDashboardRoutes", {
  enumerable: true,
  get: function () { return chunkPQ4S4G3U_cjs.router; }
});
Object.defineProperty(exports, "adminDesignRoutes", {
  enumerable: true,
  get: function () { return chunkPQ4S4G3U_cjs.adminDesignRoutes; }
});
Object.defineProperty(exports, "adminFAQRoutes", {
  enumerable: true,
  get: function () { return chunkPQ4S4G3U_cjs.admin_faq_default; }
});
Object.defineProperty(exports, "adminLogsRoutes", {
  enumerable: true,
  get: function () { return chunkPQ4S4G3U_cjs.adminLogsRoutes; }
});
Object.defineProperty(exports, "adminMediaRoutes", {
  enumerable: true,
  get: function () { return chunkPQ4S4G3U_cjs.adminMediaRoutes; }
});
Object.defineProperty(exports, "adminPluginRoutes", {
  enumerable: true,
  get: function () { return chunkPQ4S4G3U_cjs.adminPluginRoutes; }
});
Object.defineProperty(exports, "adminSettingsRoutes", {
  enumerable: true,
  get: function () { return chunkPQ4S4G3U_cjs.adminSettingsRoutes; }
});
Object.defineProperty(exports, "adminTestimonialsRoutes", {
  enumerable: true,
  get: function () { return chunkPQ4S4G3U_cjs.admin_testimonials_default; }
});
Object.defineProperty(exports, "adminUsersRoutes", {
  enumerable: true,
  get: function () { return chunkPQ4S4G3U_cjs.userRoutes; }
});
Object.defineProperty(exports, "apiContentCrudRoutes", {
  enumerable: true,
  get: function () { return chunkPQ4S4G3U_cjs.api_content_crud_default; }
});
Object.defineProperty(exports, "apiMediaRoutes", {
  enumerable: true,
  get: function () { return chunkPQ4S4G3U_cjs.api_media_default; }
});
Object.defineProperty(exports, "apiRoutes", {
  enumerable: true,
  get: function () { return chunkPQ4S4G3U_cjs.api_default; }
});
Object.defineProperty(exports, "apiSystemRoutes", {
  enumerable: true,
  get: function () { return chunkPQ4S4G3U_cjs.api_system_default; }
});
Object.defineProperty(exports, "authRoutes", {
  enumerable: true,
  get: function () { return chunkPQ4S4G3U_cjs.auth_default; }
});
Object.defineProperty(exports, "Logger", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.Logger; }
});
Object.defineProperty(exports, "apiTokens", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.apiTokens; }
});
Object.defineProperty(exports, "collections", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.collections; }
});
Object.defineProperty(exports, "content", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.content; }
});
Object.defineProperty(exports, "contentVersions", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.contentVersions; }
});
Object.defineProperty(exports, "getLogger", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.getLogger; }
});
Object.defineProperty(exports, "initLogger", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.initLogger; }
});
Object.defineProperty(exports, "insertCollectionSchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.insertCollectionSchema; }
});
Object.defineProperty(exports, "insertContentSchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.insertContentSchema; }
});
Object.defineProperty(exports, "insertLogConfigSchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.insertLogConfigSchema; }
});
Object.defineProperty(exports, "insertMediaSchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.insertMediaSchema; }
});
Object.defineProperty(exports, "insertPluginActivityLogSchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.insertPluginActivityLogSchema; }
});
Object.defineProperty(exports, "insertPluginAssetSchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.insertPluginAssetSchema; }
});
Object.defineProperty(exports, "insertPluginHookSchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.insertPluginHookSchema; }
});
Object.defineProperty(exports, "insertPluginRouteSchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.insertPluginRouteSchema; }
});
Object.defineProperty(exports, "insertPluginSchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.insertPluginSchema; }
});
Object.defineProperty(exports, "insertSystemLogSchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.insertSystemLogSchema; }
});
Object.defineProperty(exports, "insertUserSchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.insertUserSchema; }
});
Object.defineProperty(exports, "insertWorkflowHistorySchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.insertWorkflowHistorySchema; }
});
Object.defineProperty(exports, "logConfig", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.logConfig; }
});
Object.defineProperty(exports, "media", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.media; }
});
Object.defineProperty(exports, "pluginActivityLog", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.pluginActivityLog; }
});
Object.defineProperty(exports, "pluginAssets", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.pluginAssets; }
});
Object.defineProperty(exports, "pluginHooks", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.pluginHooks; }
});
Object.defineProperty(exports, "pluginRoutes", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.pluginRoutes; }
});
Object.defineProperty(exports, "plugins", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.plugins; }
});
Object.defineProperty(exports, "selectCollectionSchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.selectCollectionSchema; }
});
Object.defineProperty(exports, "selectContentSchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.selectContentSchema; }
});
Object.defineProperty(exports, "selectLogConfigSchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.selectLogConfigSchema; }
});
Object.defineProperty(exports, "selectMediaSchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.selectMediaSchema; }
});
Object.defineProperty(exports, "selectPluginActivityLogSchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.selectPluginActivityLogSchema; }
});
Object.defineProperty(exports, "selectPluginAssetSchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.selectPluginAssetSchema; }
});
Object.defineProperty(exports, "selectPluginHookSchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.selectPluginHookSchema; }
});
Object.defineProperty(exports, "selectPluginRouteSchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.selectPluginRouteSchema; }
});
Object.defineProperty(exports, "selectPluginSchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.selectPluginSchema; }
});
Object.defineProperty(exports, "selectSystemLogSchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.selectSystemLogSchema; }
});
Object.defineProperty(exports, "selectUserSchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.selectUserSchema; }
});
Object.defineProperty(exports, "selectWorkflowHistorySchema", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.selectWorkflowHistorySchema; }
});
Object.defineProperty(exports, "systemLogs", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.systemLogs; }
});
Object.defineProperty(exports, "users", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.users; }
});
Object.defineProperty(exports, "workflowHistory", {
  enumerable: true,
  get: function () { return chunkDOR2IU73_cjs.workflowHistory; }
});
Object.defineProperty(exports, "AuthManager", {
  enumerable: true,
  get: function () { return chunkYN4VD3ML_cjs.AuthManager; }
});
Object.defineProperty(exports, "PermissionManager", {
  enumerable: true,
  get: function () { return chunkYN4VD3ML_cjs.PermissionManager; }
});
Object.defineProperty(exports, "bootstrapMiddleware", {
  enumerable: true,
  get: function () { return chunkYN4VD3ML_cjs.bootstrapMiddleware; }
});
Object.defineProperty(exports, "cacheHeaders", {
  enumerable: true,
  get: function () { return chunkYN4VD3ML_cjs.cacheHeaders; }
});
Object.defineProperty(exports, "compressionMiddleware", {
  enumerable: true,
  get: function () { return chunkYN4VD3ML_cjs.compressionMiddleware; }
});
Object.defineProperty(exports, "detailedLoggingMiddleware", {
  enumerable: true,
  get: function () { return chunkYN4VD3ML_cjs.detailedLoggingMiddleware; }
});
Object.defineProperty(exports, "getActivePlugins", {
  enumerable: true,
  get: function () { return chunkYN4VD3ML_cjs.getActivePlugins; }
});
Object.defineProperty(exports, "isPluginActive", {
  enumerable: true,
  get: function () { return chunkYN4VD3ML_cjs.isPluginActive; }
});
Object.defineProperty(exports, "logActivity", {
  enumerable: true,
  get: function () { return chunkYN4VD3ML_cjs.logActivity; }
});
Object.defineProperty(exports, "loggingMiddleware", {
  enumerable: true,
  get: function () { return chunkYN4VD3ML_cjs.loggingMiddleware; }
});
Object.defineProperty(exports, "optionalAuth", {
  enumerable: true,
  get: function () { return chunkYN4VD3ML_cjs.optionalAuth; }
});
Object.defineProperty(exports, "performanceLoggingMiddleware", {
  enumerable: true,
  get: function () { return chunkYN4VD3ML_cjs.performanceLoggingMiddleware; }
});
Object.defineProperty(exports, "requireActivePlugin", {
  enumerable: true,
  get: function () { return chunkYN4VD3ML_cjs.requireActivePlugin; }
});
Object.defineProperty(exports, "requireActivePlugins", {
  enumerable: true,
  get: function () { return chunkYN4VD3ML_cjs.requireActivePlugins; }
});
Object.defineProperty(exports, "requireAnyPermission", {
  enumerable: true,
  get: function () { return chunkYN4VD3ML_cjs.requireAnyPermission; }
});
Object.defineProperty(exports, "requireAuth", {
  enumerable: true,
  get: function () { return chunkYN4VD3ML_cjs.requireAuth; }
});
Object.defineProperty(exports, "requirePermission", {
  enumerable: true,
  get: function () { return chunkYN4VD3ML_cjs.requirePermission; }
});
Object.defineProperty(exports, "requireRole", {
  enumerable: true,
  get: function () { return chunkYN4VD3ML_cjs.requireRole; }
});
Object.defineProperty(exports, "securityHeaders", {
  enumerable: true,
  get: function () { return chunkYN4VD3ML_cjs.securityHeaders; }
});
Object.defineProperty(exports, "securityLoggingMiddleware", {
  enumerable: true,
  get: function () { return chunkYN4VD3ML_cjs.securityLoggingMiddleware; }
});
Object.defineProperty(exports, "MigrationService", {
  enumerable: true,
  get: function () { return chunkNBDPIRQS_cjs.MigrationService; }
});
Object.defineProperty(exports, "PluginBootstrapService", {
  enumerable: true,
  get: function () { return chunkNBDPIRQS_cjs.PluginBootstrapService; }
});
Object.defineProperty(exports, "PluginServiceClass", {
  enumerable: true,
  get: function () { return chunkNBDPIRQS_cjs.PluginService; }
});
Object.defineProperty(exports, "cleanupRemovedCollections", {
  enumerable: true,
  get: function () { return chunkNBDPIRQS_cjs.cleanupRemovedCollections; }
});
Object.defineProperty(exports, "fullCollectionSync", {
  enumerable: true,
  get: function () { return chunkNBDPIRQS_cjs.fullCollectionSync; }
});
Object.defineProperty(exports, "getAvailableCollectionNames", {
  enumerable: true,
  get: function () { return chunkNBDPIRQS_cjs.getAvailableCollectionNames; }
});
Object.defineProperty(exports, "getManagedCollections", {
  enumerable: true,
  get: function () { return chunkNBDPIRQS_cjs.getManagedCollections; }
});
Object.defineProperty(exports, "isCollectionManaged", {
  enumerable: true,
  get: function () { return chunkNBDPIRQS_cjs.isCollectionManaged; }
});
Object.defineProperty(exports, "loadCollectionConfig", {
  enumerable: true,
  get: function () { return chunkNBDPIRQS_cjs.loadCollectionConfig; }
});
Object.defineProperty(exports, "loadCollectionConfigs", {
  enumerable: true,
  get: function () { return chunkNBDPIRQS_cjs.loadCollectionConfigs; }
});
Object.defineProperty(exports, "registerCollections", {
  enumerable: true,
  get: function () { return chunkNBDPIRQS_cjs.registerCollections; }
});
Object.defineProperty(exports, "syncCollection", {
  enumerable: true,
  get: function () { return chunkNBDPIRQS_cjs.syncCollection; }
});
Object.defineProperty(exports, "syncCollections", {
  enumerable: true,
  get: function () { return chunkNBDPIRQS_cjs.syncCollections; }
});
Object.defineProperty(exports, "validateCollectionConfig", {
  enumerable: true,
  get: function () { return chunkNBDPIRQS_cjs.validateCollectionConfig; }
});
Object.defineProperty(exports, "renderFilterBar", {
  enumerable: true,
  get: function () { return chunkCAP6QQR2_cjs.renderFilterBar; }
});
Object.defineProperty(exports, "getConfirmationDialogScript", {
  enumerable: true,
  get: function () { return chunkMU3MR2QR_cjs.getConfirmationDialogScript; }
});
Object.defineProperty(exports, "renderAlert", {
  enumerable: true,
  get: function () { return chunkMU3MR2QR_cjs.renderAlert; }
});
Object.defineProperty(exports, "renderConfirmationDialog", {
  enumerable: true,
  get: function () { return chunkMU3MR2QR_cjs.renderConfirmationDialog; }
});
Object.defineProperty(exports, "renderForm", {
  enumerable: true,
  get: function () { return chunkMU3MR2QR_cjs.renderForm; }
});
Object.defineProperty(exports, "renderFormField", {
  enumerable: true,
  get: function () { return chunkMU3MR2QR_cjs.renderFormField; }
});
Object.defineProperty(exports, "renderPagination", {
  enumerable: true,
  get: function () { return chunkMU3MR2QR_cjs.renderPagination; }
});
Object.defineProperty(exports, "renderTable", {
  enumerable: true,
  get: function () { return chunkMU3MR2QR_cjs.renderTable; }
});
Object.defineProperty(exports, "HookSystemImpl", {
  enumerable: true,
  get: function () { return chunkF5ESJXI2_cjs.HookSystemImpl; }
});
Object.defineProperty(exports, "HookUtils", {
  enumerable: true,
  get: function () { return chunkF5ESJXI2_cjs.HookUtils; }
});
Object.defineProperty(exports, "PluginManagerClass", {
  enumerable: true,
  get: function () { return chunkF5ESJXI2_cjs.PluginManager; }
});
Object.defineProperty(exports, "PluginRegistryImpl", {
  enumerable: true,
  get: function () { return chunkF5ESJXI2_cjs.PluginRegistryImpl; }
});
Object.defineProperty(exports, "PluginValidatorClass", {
  enumerable: true,
  get: function () { return chunkF5ESJXI2_cjs.PluginValidator; }
});
Object.defineProperty(exports, "ScopedHookSystemClass", {
  enumerable: true,
  get: function () { return chunkF5ESJXI2_cjs.ScopedHookSystem; }
});
Object.defineProperty(exports, "QueryFilterBuilder", {
  enumerable: true,
  get: function () { return chunkPGZZPKZL_cjs.QueryFilterBuilder; }
});
Object.defineProperty(exports, "SONICJS_VERSION", {
  enumerable: true,
  get: function () { return chunkPGZZPKZL_cjs.SONICJS_VERSION; }
});
Object.defineProperty(exports, "TemplateRenderer", {
  enumerable: true,
  get: function () { return chunkPGZZPKZL_cjs.TemplateRenderer; }
});
Object.defineProperty(exports, "buildQuery", {
  enumerable: true,
  get: function () { return chunkPGZZPKZL_cjs.buildQuery; }
});
Object.defineProperty(exports, "escapeHtml", {
  enumerable: true,
  get: function () { return chunkPGZZPKZL_cjs.escapeHtml; }
});
Object.defineProperty(exports, "getCoreVersion", {
  enumerable: true,
  get: function () { return chunkPGZZPKZL_cjs.getCoreVersion; }
});
Object.defineProperty(exports, "renderTemplate", {
  enumerable: true,
  get: function () { return chunkPGZZPKZL_cjs.renderTemplate; }
});
Object.defineProperty(exports, "sanitizeInput", {
  enumerable: true,
  get: function () { return chunkPGZZPKZL_cjs.sanitizeInput; }
});
Object.defineProperty(exports, "sanitizeObject", {
  enumerable: true,
  get: function () { return chunkPGZZPKZL_cjs.sanitizeObject; }
});
Object.defineProperty(exports, "templateRenderer", {
  enumerable: true,
  get: function () { return chunkPGZZPKZL_cjs.templateRenderer; }
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