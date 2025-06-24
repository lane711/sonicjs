// Content versioning system
export interface ContentVersion {
  id: string
  contentId: string
  version: number
  title: string
  slug: string
  data: Record<string, any>
  status: string
  authorId: string
  
  // Change tracking
  changeType: 'create' | 'update' | 'publish' | 'unpublish' | 'archive'
  changesSummary?: string
  fieldsChanged?: string[]
  
  // Metadata
  createdAt: number
  createdBy: string
  comment?: string
  
  // Size tracking
  contentSize: number
  diffSize?: number
}

// Difference between versions
export interface VersionDiff {
  field: string
  oldValue: any
  newValue: any
  changeType: 'added' | 'removed' | 'modified'
}

// Version comparison result
export interface VersionComparison {
  fromVersion: number
  toVersion: number
  differences: VersionDiff[]
  summary: string
  fieldsChanged: string[]
  contentSizeDiff: number
}

// Content versioning manager
export class ContentVersioning {
  // Create a new version of content
  static createVersion(
    contentId: string,
    currentContent: any,
    userId: string,
    previousVersion?: ContentVersion,
    changeType: ContentVersion['changeType'] = 'update',
    comment?: string
  ): ContentVersion {
    const now = Date.now()
    const version = previousVersion ? previousVersion.version + 1 : 1
    
    // Calculate changes if previous version exists
    let fieldsChanged: string[] = []
    let changesSummary = ''
    let diffSize = 0
    
    if (previousVersion) {
      const comparison = this.compareVersions(previousVersion.data, currentContent.data)
      fieldsChanged = comparison.fieldsChanged
      changesSummary = comparison.summary
      diffSize = comparison.contentSizeDiff
    }

    const contentSize = JSON.stringify(currentContent.data).length

    const newVersion: ContentVersion = {
      id: crypto.randomUUID(),
      contentId,
      version,
      title: currentContent.title,
      slug: currentContent.slug,
      data: { ...currentContent.data },
      status: currentContent.status,
      authorId: currentContent.authorId,
      changeType,
      changesSummary,
      fieldsChanged,
      createdAt: now,
      createdBy: userId,
      comment,
      contentSize,
      diffSize
    }

    return newVersion
  }

  // Compare two versions and generate differences
  static compareVersions(oldData: Record<string, any>, newData: Record<string, any>): VersionComparison {
    const differences: VersionDiff[] = []
    const fieldsChanged: string[] = []
    
    // Get all field names from both versions
    const allFields = new Set([...Object.keys(oldData), ...Object.keys(newData)])
    
    allFields.forEach(field => {
      const oldValue = oldData[field]
      const newValue = newData[field]
      
      if (oldValue === undefined && newValue !== undefined) {
        differences.push({
          field,
          oldValue: null,
          newValue,
          changeType: 'added'
        })
        fieldsChanged.push(field)
      } else if (oldValue !== undefined && newValue === undefined) {
        differences.push({
          field,
          oldValue,
          newValue: null,
          changeType: 'removed'
        })
        fieldsChanged.push(field)
      } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        differences.push({
          field,
          oldValue,
          newValue,
          changeType: 'modified'
        })
        fieldsChanged.push(field)
      }
    })

    // Generate summary
    const summary = this.generateChangesSummary(differences)
    
    // Calculate content size difference
    const oldSize = JSON.stringify(oldData).length
    const newSize = JSON.stringify(newData).length
    const contentSizeDiff = newSize - oldSize

    return {
      fromVersion: 0, // This would be set by the caller
      toVersion: 0,   // This would be set by the caller
      differences,
      summary,
      fieldsChanged,
      contentSizeDiff
    }
  }

  // Generate human-readable changes summary
  static generateChangesSummary(differences: VersionDiff[]): string {
    if (differences.length === 0) return 'No changes'
    
    const added = differences.filter(d => d.changeType === 'added')
    const removed = differences.filter(d => d.changeType === 'removed')
    const modified = differences.filter(d => d.changeType === 'modified')
    
    const parts: string[] = []
    
    if (added.length > 0) {
      parts.push(`Added ${added.length} field${added.length === 1 ? '' : 's'}`)
    }
    if (modified.length > 0) {
      parts.push(`Modified ${modified.length} field${modified.length === 1 ? '' : 's'}`)
    }
    if (removed.length > 0) {
      parts.push(`Removed ${removed.length} field${removed.length === 1 ? '' : 's'}`)
    }
    
    return parts.join(', ')
  }

  // Get version history for content
  static async getVersionHistory(
    contentId: string,
    db: any,
    limit: number = 10,
    offset: number = 0
  ): Promise<ContentVersion[]> {
    const stmt = db.prepare(`
      SELECT * FROM content_versions 
      WHERE contentId = ? 
      ORDER BY version DESC 
      LIMIT ? OFFSET ?
    `)
    
    const { results } = await stmt.bind(contentId, limit, offset).all()
    
    return results.map((row: any) => ({
      ...row,
      data: JSON.parse(row.data),
      fieldsChanged: row.fieldsChanged ? JSON.parse(row.fieldsChanged) : []
    }))
  }

  // Restore content to a specific version
  static async restoreToVersion(
    contentId: string,
    targetVersion: number,
    userId: string,
    db: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the target version
      const versionStmt = db.prepare(`
        SELECT * FROM content_versions 
        WHERE contentId = ? AND version = ?
      `)
      const version = await versionStmt.bind(contentId, targetVersion).first()
      
      if (!version) {
        return { success: false, error: 'Version not found' }
      }

      const versionData = JSON.parse(version.data)
      
      // Update the current content
      const now = Date.now()
      const updateStmt = db.prepare(`
        UPDATE content 
        SET title = ?, slug = ?, data = ?, updatedAt = ?, version = version + 1
        WHERE id = ?
      `)
      
      await updateStmt.bind(
        version.title,
        version.slug,
        JSON.stringify(versionData),
        now,
        contentId
      ).run()

      // Create a new version entry for this restoration
      const newVersion = this.createVersion(
        contentId,
        {
          title: version.title,
          slug: version.slug,
          data: versionData,
          status: version.status,
          authorId: version.authorId
        },
        userId,
        undefined,
        'update',
        `Restored to version ${targetVersion}`
      )

      // Save the new version
      await this.saveVersion(newVersion, db)

      return { success: true }
    } catch (error) {
      console.error('Error restoring version:', error)
      return { success: false, error: 'Failed to restore version' }
    }
  }

  // Save version to database
  static async saveVersion(version: ContentVersion, db: any): Promise<void> {
    const stmt = db.prepare(`
      INSERT INTO content_versions (
        id, contentId, version, title, slug, data, status, authorId,
        changeType, changesSummary, fieldsChanged, createdAt, createdBy,
        comment, contentSize, diffSize
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    await stmt.bind(
      version.id,
      version.contentId,
      version.version,
      version.title,
      version.slug,
      JSON.stringify(version.data),
      version.status,
      version.authorId,
      version.changeType,
      version.changesSummary || '',
      JSON.stringify(version.fieldsChanged || []),
      version.createdAt,
      version.createdBy,
      version.comment || '',
      version.contentSize,
      version.diffSize || 0
    ).run()
  }

  // Clean up old versions (keep only specified number)
  static async cleanupOldVersions(
    contentId: string,
    keepVersions: number,
    db: any
  ): Promise<number> {
    // Get versions older than the ones to keep
    const stmt = db.prepare(`
      SELECT id FROM content_versions 
      WHERE contentId = ? 
      ORDER BY version DESC 
      LIMIT -1 OFFSET ?
    `)
    
    const { results } = await stmt.bind(contentId, keepVersions).all()
    
    if (results.length === 0) return 0

    // Delete old versions
    const versionIds = results.map((r: any) => r.id)
    const placeholders = versionIds.map(() => '?').join(',')
    const deleteStmt = db.prepare(`
      DELETE FROM content_versions 
      WHERE id IN (${placeholders})
    `)
    
    await deleteStmt.bind(...versionIds).run()
    
    return results.length
  }

  // Generate version timeline HTML for admin interface
  static generateVersionTimelineHTML(versions: ContentVersion[]): string {
    if (versions.length === 0) {
      return '<p class="text-gray-500">No version history available.</p>'
    }

    const timelineItems = versions.map(version => {
      const date = new Date(version.createdAt).toLocaleString()
      const changeTypeColors = {
        create: 'bg-green-100 text-green-800',
        update: 'bg-blue-100 text-blue-800',
        publish: 'bg-purple-100 text-purple-800',
        unpublish: 'bg-yellow-100 text-yellow-800',
        archive: 'bg-gray-100 text-gray-800'
      }
      
      const colorClass = changeTypeColors[version.changeType] || 'bg-gray-100 text-gray-800'
      
      return `
        <div class="version-item flex items-center gap-4 p-4 border-b border-gray-200">
          <div class="version-marker w-8 h-8 rounded-full ${colorClass} flex items-center justify-center text-sm font-medium">
            v${version.version}
          </div>
          <div class="version-details flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-medium">${version.changesSummary || 'No changes recorded'}</span>
              <span class="text-sm text-gray-500">${date}</span>
            </div>
            <div class="text-sm text-gray-600">
              By: ${version.createdBy} | Size: ${(version.contentSize / 1024).toFixed(1)}KB
              ${version.diffSize ? ` (${version.diffSize > 0 ? '+' : ''}${(version.diffSize / 1024).toFixed(1)}KB)` : ''}
            </div>
            ${version.comment ? `<div class="text-sm text-gray-700 mt-1">"${version.comment}"</div>` : ''}
            ${version.fieldsChanged && version.fieldsChanged.length > 0 ? 
              `<div class="text-xs text-gray-500 mt-1">Changed: ${version.fieldsChanged.join(', ')}</div>` : ''
            }
          </div>
          <div class="version-actions flex gap-2">
            <button 
              class="btn btn-sm btn-secondary"
              hx-get="/admin/content/versions/${version.id}/compare"
              hx-target="#version-comparison"
            >
              View
            </button>
            <button 
              class="btn btn-sm btn-primary"
              hx-post="/admin/content/${version.contentId}/restore"
              hx-vals='{"version": ${version.version}}'
              hx-confirm="Restore to version ${version.version}? This will create a new version."
            >
              Restore
            </button>
          </div>
        </div>
      `
    }).join('')

    return `
      <div class="version-timeline">
        <h3 class="text-lg font-medium mb-4">Version History</h3>
        <div class="timeline-container">
          ${timelineItems}
        </div>
      </div>
    `
  }

  // Generate version comparison HTML
  static generateComparisonHTML(comparison: VersionComparison): string {
    if (comparison.differences.length === 0) {
      return '<p class="text-gray-500">No differences found between these versions.</p>'
    }

    const diffItems = comparison.differences.map(diff => {
      const typeColors = {
        added: 'border-l-green-500 bg-green-50',
        removed: 'border-l-red-500 bg-red-50',
        modified: 'border-l-blue-500 bg-blue-50'
      }
      
      const typeIcons = {
        added: '➕',
        removed: '➖',
        modified: '✏️'
      }
      
      const colorClass = typeColors[diff.changeType]
      const icon = typeIcons[diff.changeType]
      
      return `
        <div class="diff-item border-l-4 ${colorClass} p-4 mb-4">
          <div class="diff-header flex items-center gap-2 mb-2">
            <span class="diff-icon">${icon}</span>
            <span class="font-medium">${diff.field}</span>
            <span class="text-sm text-gray-500 capitalize">${diff.changeType}</span>
          </div>
          ${diff.changeType === 'added' ? `
            <div class="diff-content">
              <div class="text-sm text-gray-600 mb-1">Added:</div>
              <div class="bg-white p-2 rounded border">${this.formatValue(diff.newValue)}</div>
            </div>
          ` : diff.changeType === 'removed' ? `
            <div class="diff-content">
              <div class="text-sm text-gray-600 mb-1">Removed:</div>
              <div class="bg-white p-2 rounded border">${this.formatValue(diff.oldValue)}</div>
            </div>
          ` : `
            <div class="diff-content grid grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-gray-600 mb-1">Before:</div>
                <div class="bg-white p-2 rounded border">${this.formatValue(diff.oldValue)}</div>
              </div>
              <div>
                <div class="text-sm text-gray-600 mb-1">After:</div>
                <div class="bg-white p-2 rounded border">${this.formatValue(diff.newValue)}</div>
              </div>
            </div>
          `}
        </div>
      `
    }).join('')

    return `
      <div class="version-comparison">
        <div class="comparison-header mb-6">
          <h3 class="text-lg font-medium">
            Comparing Version ${comparison.fromVersion} → ${comparison.toVersion}
          </h3>
          <p class="text-gray-600">${comparison.summary}</p>
          ${comparison.contentSizeDiff !== 0 ? `
            <p class="text-sm text-gray-500">
              Content size: ${comparison.contentSizeDiff > 0 ? '+' : ''}${(comparison.contentSizeDiff / 1024).toFixed(1)}KB
            </p>
          ` : ''}
        </div>
        <div class="differences">
          ${diffItems}
        </div>
      </div>
    `
  }

  // Format value for display
  static formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '<em class="text-gray-400">null</em>'
    }
    
    if (typeof value === 'string') {
      if (value.length > 200) {
        return value.substring(0, 200) + '...'
      }
      return value
    }
    
    if (typeof value === 'object') {
      try {
        return `<pre class="text-xs">${JSON.stringify(value, null, 2)}</pre>`
      } catch {
        return String(value)
      }
    }
    
    return String(value)
  }
}