import { useCallback } from 'react';
import { useActivityTimeline } from '../context/ActivityTimelineContext';

export const useApiActivityLogger = () => {
  const { addEvent } = useActivityTimeline();

  const logKBARequest = useCallback(
    (medicaidId: string, fields: string[]) => {
      addEvent({
        type: 'KBA_REQUEST',
        title: 'KBA Verification Started',
        description: `Verifying identity for ${medicaidId}`,
        status: 'info',
        data: {
          medicaid_id: medicaidId,
          fields_provided: fields,
        },
        metadata: {
          method: 'POST',
          url: '/api/kba/verify',
        },
      });
    },
    [addEvent]
  );

  const logKBASuccess = useCallback(
    (person: any, fieldsChecked: number, matches: number) => {
      addEvent({
        type: 'KBA_SUCCESS',
        title: 'Identity Verified ✓',
        description: `${matches} of ${fieldsChecked} fields matched`,
        status: 'success',
        data: {
          person,
          fields_checked: fieldsChecked,
          matches,
        },
      });

      // Also log the audit entry
      addEvent({
        type: 'AUDIT_LOG',
        title: 'Audit Log Created',
        description: 'Action: KBA_VERIFIED',
        status: 'info',
        data: {
          action: 'KBA_VERIFIED',
          user_id: person.medicaid_id,
          metadata: { fields_checked: fieldsChecked, matches },
        },
      });
    },
    [addEvent]
  );

  const logKBAFailure = useCallback(
    (message: string, attemptsRemaining?: number) => {
      addEvent({
        type: 'KBA_FAILURE',
        title: 'Verification Failed',
        description: message,
        status: 'error',
        data: {
          message,
          attempts_remaining: attemptsRemaining,
        },
      });
    },
    [addEvent]
  );

  const logAuthToken = useCallback(
    (userId: string) => {
      addEvent({
        type: 'AUTH_TOKEN_GENERATED',
        title: 'GCIP Token Generated',
        description: 'Custom authentication token created',
        status: 'success',
        data: {
          user_id: userId,
          token_type: 'custom',
          provider: 'Google Cloud Identity Platform',
        },
      });
    },
    [addEvent]
  );

  const logAuthSuccess = useCallback(
    (user: any) => {
      addEvent({
        type: 'AUTH_SUCCESS',
        title: 'User Authenticated',
        description: `Logged in as ${user.email || user.medicaid_id}`,
        status: 'success',
        data: {
          user_id: user.medicaid_id,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
        },
      });
    },
    [addEvent]
  );

  const logFirestoreRead = useCallback(
    (collection: string, documentId?: string) => {
      addEvent({
        type: 'FIRESTORE_READ',
        title: 'Firestore Read',
        description: `Reading from ${collection}${documentId ? `/${documentId}` : ''}`,
        status: 'info',
        data: {
          operation: 'READ',
          collection,
          document_id: documentId,
        },
      });
    },
    [addEvent]
  );

  const logFirestoreWrite = useCallback(
    (collection: string, documentId: string, data: any) => {
      addEvent({
        type: 'FIRESTORE_WRITE',
        title: 'Firestore Write',
        description: `Writing to ${collection}/${documentId}`,
        status: 'success',
        data: {
          operation: 'WRITE',
          collection,
          document_id: documentId,
          data,
        },
      });
    },
    [addEvent]
  );

  const logConsentUpdate = useCallback(
    (providerId: string, status: string, isGlobal: boolean = false) => {
      addEvent({
        type: 'CONSENT_UPDATE',
        title: 'Consent Updated',
        description: `${isGlobal ? 'Global consent' : `Provider ${providerId}`} → ${status}`,
        status: status === 'GRANTED' ? 'success' : 'warning',
        data: {
          provider_id: providerId,
          consent_status: status,
          is_global: isGlobal,
          timestamp: new Date().toISOString(),
        },
      });

      // Log the Firestore write
      logFirestoreWrite('consents', `${providerId}_consent`, {
        status,
        updated_at: new Date().toISOString(),
      });

      // Log the audit entry
      addEvent({
        type: 'AUDIT_LOG',
        title: 'Audit Log Created',
        description: `Action: CONSENT_${status}`,
        status: 'info',
        data: {
          action: `CONSENT_${status}`,
          provider_id: providerId,
          is_global: isGlobal,
        },
      });
    },
    [addEvent, logFirestoreWrite]
  );

  const logApiRequest = useCallback(
    (method: string, url: string, data?: any) => {
      addEvent({
        type: 'API_REQUEST',
        title: `${method} Request`,
        description: url,
        status: 'info',
        data,
        metadata: {
          method,
          url,
        },
      });
    },
    [addEvent]
  );

  const logApiResponse = useCallback(
    (method: string, url: string, statusCode: number, data?: any, duration?: number) => {
      addEvent({
        type: 'API_RESPONSE',
        title: `${method} Response`,
        description: url,
        status: statusCode < 400 ? 'success' : 'error',
        data,
        metadata: {
          method,
          url,
          statusCode,
          duration,
        },
      });
    },
    [addEvent]
  );

  const logError = useCallback(
    (title: string, error: any) => {
      addEvent({
        type: 'ERROR',
        title,
        description: error.message || 'An error occurred',
        status: 'error',
        data: {
          error: error.toString(),
          stack: error.stack,
        },
      });
    },
    [addEvent]
  );

  const logInfo = useCallback(
    (title: string, description?: string, data?: any) => {
      addEvent({
        type: 'INFO',
        title,
        description,
        status: 'info',
        data,
      });
    },
    [addEvent]
  );

  return {
    logKBARequest,
    logKBASuccess,
    logKBAFailure,
    logAuthToken,
    logAuthSuccess,
    logFirestoreRead,
    logFirestoreWrite,
    logConsentUpdate,
    logApiRequest,
    logApiResponse,
    logError,
    logInfo,
  };
};
