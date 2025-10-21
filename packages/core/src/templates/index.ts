/**
 * Templates Module Exports
 *
 * Reusable HTML template components for SonicJS
 */

// Form templates
export { renderForm, renderFormField } from './form.template'
export type { FormField, FormData } from './form.template'

// Table templates
export { renderTable } from './table.template'
export type { TableColumn, TableData } from './table.template'

// Pagination templates
export { renderPagination } from './pagination.template'
export type { PaginationData } from './pagination.template'

// Alert templates
export { renderAlert } from './alert.template'
export type { AlertData } from './alert.template'

// Confirmation dialog templates
export { renderConfirmationDialog, getConfirmationDialogScript } from './confirmation-dialog.template'
export type { ConfirmationDialogOptions } from './confirmation-dialog.template'

// Filter bar templates
export { renderFilterBar } from './filter-bar.template'
export type { FilterBarData, Filter, FilterOption } from './filter-bar.template'

// Layout templates
export { renderAdminLayout } from './layouts/admin-layout-v2.template'
export { renderAdminLayoutCatalyst } from './layouts/admin-layout-catalyst.template'
export type { AdminLayoutData } from './layouts/admin-layout-v2.template'
export type { AdminLayoutCatalystData } from './layouts/admin-layout-catalyst.template'

// Component templates
export { renderLogo } from './components/logo.template'

// Re-export commonly used template types for convenience
export type { TableData } from './table.template'
