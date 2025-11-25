/**
 * Audit action types for tracking consent changes.
 */
export const AuditAction = {
  CONSENT_GRANTED: 'consent_granted',
  CONSENT_REVOKED: 'consent_revoked',
  CONSENT_UPDATED: 'consent_updated',
  KBA_VERIFIED: 'kba_verified',
  KBA_FAILED: 'kba_failed',
  LOGIN: 'login',
  LOGOUT: 'logout',
} as const;

export type AuditAction = typeof AuditAction[keyof typeof AuditAction];

/**
 * Audit log entry for tracking user actions and consent changes.
 */
export interface AuditLog {
  /** Unique log entry identifier */
  id: string;
  
  /** User ID who performed the action */
  userId: string;
  
  /** Action performed */
  action: AuditAction;
  
  /** Provider ID (if applicable) */
  providerId?: string;
  
  /** Timestamp of the action */
  timestamp: Date;
  
  /** IP address of the user (for security) */
  ipAddress?: string;
  
  /** Additional metadata about the action */
  metadata?: Record<string, unknown>;
}

/**
 * Response containing audit log entries.
 */
export interface AuditLogResponse {
  /** List of audit log entries */
  logs: AuditLog[];
  
  /** Total count of logs */
  total: number;
  
  /** Optional pagination token */
  nextToken?: string;
}
