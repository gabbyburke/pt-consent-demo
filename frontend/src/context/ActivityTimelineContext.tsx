import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export type ActivityEventType =
  | 'KBA_REQUEST'
  | 'KBA_SUCCESS'
  | 'KBA_FAILURE'
  | 'AUTH_TOKEN_GENERATED'
  | 'AUTH_SUCCESS'
  | 'FIRESTORE_READ'
  | 'FIRESTORE_WRITE'
  | 'CONSENT_UPDATE'
  | 'AUDIT_LOG'
  | 'API_REQUEST'
  | 'API_RESPONSE'
  | 'ERROR'
  | 'INFO';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  timestamp: Date;
  title: string;
  description?: string;
  data?: any;
  status?: 'success' | 'error' | 'info' | 'warning';
  metadata?: {
    method?: string;
    url?: string;
    statusCode?: number;
    duration?: number;
  };
}

interface ActivityTimelineContextType {
  events: ActivityEvent[];
  addEvent: (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
  clearEvents: () => void;
  isPaused: boolean;
  togglePause: () => void;
}

const ActivityTimelineContext = createContext<ActivityTimelineContextType | undefined>(undefined);

export const useActivityTimeline = () => {
  const context = useContext(ActivityTimelineContext);
  if (!context) {
    throw new Error('useActivityTimeline must be used within ActivityTimelineProvider');
  }
  return context;
};

interface ActivityTimelineProviderProps {
  children: ReactNode;
}

export const ActivityTimelineProvider: React.FC<ActivityTimelineProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  const addEvent = useCallback(
    (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
      if (isPaused) return;

      const newEvent: ActivityEvent = {
        ...event,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };

      setEvents((prev) => [newEvent, ...prev].slice(0, 100)); // Keep last 100 events
    },
    [isPaused]
  );

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  return (
    <ActivityTimelineContext.Provider
      value={{
        events,
        addEvent,
        clearEvents,
        isPaused,
        togglePause,
      }}
    >
      {children}
    </ActivityTimelineContext.Provider>
  );
};
