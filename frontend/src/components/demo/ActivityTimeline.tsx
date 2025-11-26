import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Collapse,
  Divider,
  Button,
  Paper,
} from '@mui/material';
import {
  Timeline,
  ExpandMore,
  ExpandLess,
  Clear,
  Pause,
  PlayArrow,
  Code,
  CheckCircle,
  Error as ErrorIcon,
  Info,
  Warning,
} from '@mui/icons-material';
import { useActivityTimeline } from '../../context/ActivityTimelineContext';
import type { ActivityEvent } from '../../context/ActivityTimelineContext';

const getEventIcon = (type: string, status?: string) => {
  if (status === 'error') return <ErrorIcon fontSize="small" color="error" />;
  if (status === 'warning') return <Warning fontSize="small" color="warning" />;
  if (status === 'success') return <CheckCircle fontSize="small" color="success" />;
  
  switch (type) {
    case 'KBA_REQUEST':
    case 'KBA_SUCCESS':
    case 'KBA_FAILURE':
      return '🔐';
    case 'AUTH_TOKEN_GENERATED':
    case 'AUTH_SUCCESS':
      return '🎫';
    case 'FIRESTORE_READ':
    case 'FIRESTORE_WRITE':
      return '💾';
    case 'CONSENT_UPDATE':
      return '🔄';
    case 'AUDIT_LOG':
      return '📝';
    case 'API_REQUEST':
    case 'API_RESPONSE':
      return '🌐';
    default:
      return <Info fontSize="small" color="info" />;
  }
};

const getEventColor = (status?: string) => {
  switch (status) {
    case 'success':
      return 'success.light';
    case 'error':
      return 'error.light';
    case 'warning':
      return 'warning.light';
    default:
      return 'info.light';
  }
};

interface EventItemProps {
  event: ActivityEvent;
}

const EventItem: React.FC<EventItemProps> = ({ event }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Paper
      elevation={1}
      sx={{
        p: 1.5,
        mb: 1,
        borderLeft: 4,
        borderColor: getEventColor(event.status),
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 3,
        },
      }}
    >
      <Box display="flex" alignItems="start" gap={1}>
        <Box sx={{ mt: 0.5 }}>{getEventIcon(event.type, event.status)}</Box>
        <Box flex={1}>
          <Box display="flex" justifyContent="space-between" alignItems="start">
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {event.title}
              </Typography>
              {event.description && (
                <Typography variant="caption" color="text.secondary">
                  {event.description}
                </Typography>
              )}
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography variant="caption" color="text.secondary">
                {event.timestamp.toLocaleTimeString()}
              </Typography>
              {event.data && (
                <IconButton size="small" onClick={() => setExpanded(!expanded)}>
                  {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                </IconButton>
              )}
            </Box>
          </Box>

          {event.metadata && (
            <Box display="flex" gap={0.5} mt={0.5} flexWrap="wrap">
              {event.metadata.method && (
                <Chip label={event.metadata.method} size="small" variant="outlined" />
              )}
              {event.metadata.statusCode && (
                <Chip
                  label={event.metadata.statusCode}
                  size="small"
                  color={event.metadata.statusCode < 400 ? 'success' : 'error'}
                />
              )}
              {event.metadata.duration && (
                <Chip label={`${event.metadata.duration}ms`} size="small" variant="outlined" />
              )}
            </Box>
          )}

          <Collapse in={expanded}>
            <Box
              mt={1}
              p={1}
              sx={{
                backgroundColor: 'grey.900',
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: 200,
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontSize: '11px',
                  color: '#00ff00',
                  fontFamily: 'monospace',
                }}
              >
                {JSON.stringify(event.data, null, 2)}
              </pre>
            </Box>
          </Collapse>
        </Box>
      </Box>
    </Paper>
  );
};

export const ActivityTimeline: React.FC = () => {
  const { events, clearEvents, isPaused, togglePause } = useActivityTimeline();
  const [collapsed, setCollapsed] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPaused && timelineRef.current) {
      timelineRef.current.scrollTop = 0;
    }
  }, [events, isPaused]);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '2px solid',
        borderColor: 'primary.main',
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <Timeline color="primary" />
            <Typography variant="h6" color="primary">
              Live Activity
            </Typography>
            <Chip
              label={events.length}
              size="small"
              color="primary"
              sx={{ minWidth: 40 }}
            />
          </Box>
          <Box display="flex" gap={0.5}>
            <IconButton size="small" onClick={togglePause} title={isPaused ? 'Resume' : 'Pause'}>
              {isPaused ? <PlayArrow fontSize="small" /> : <Pause fontSize="small" />}
            </IconButton>
            <IconButton size="small" onClick={clearEvents} title="Clear">
              <Clear fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <ExpandMore /> : <ExpandLess />}
            </IconButton>
          </Box>
        </Box>
      </CardContent>

      <Collapse in={!collapsed} sx={{ flex: 1, overflow: 'hidden' }}>
        <Divider />
        <Box
          ref={timelineRef}
          sx={{
            p: 2,
            height: 'calc(100vh - 250px)',
            overflow: 'auto',
            backgroundColor: 'background.default',
          }}
        >
          {events.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
              color="text.secondary"
            >
              <Code sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
              <Typography variant="body2">No activity yet</Typography>
              <Typography variant="caption">
                Interact with the app to see backend events
              </Typography>
            </Box>
          ) : (
            events.map((event) => <EventItem key={event.id} event={event} />)
          )}
        </Box>
      </Collapse>
    </Card>
  );
};
