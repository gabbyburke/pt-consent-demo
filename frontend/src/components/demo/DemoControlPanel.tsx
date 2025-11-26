import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Divider,
  Alert,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  PersonOutline,
  ExpandMore,
  ExpandLess,
  Refresh,
  CheckCircle,
  Error,
} from '@mui/icons-material';

interface TestPerson {
  medicaid_id: string;
  first_name: string;
  last_name: string;
  ssn_last_4: string;
  date_of_birth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  email: string;
  phone: string;
}

interface KBAStatus {
  locked: boolean;
  attempts?: number;
  message?: string;
  locked_until?: string;
}

const TEST_PERSONS: TestPerson[] = [
  {
    medicaid_id: 'CO-DEMO-001',
    first_name: 'Alice',
    last_name: 'Anderson',
    ssn_last_4: '1234',
    date_of_birth: '1985-03-15',
    address: {
      street: '123 Demo Street',
      city: 'Denver',
      state: 'CO',
      zip: '80202',
    },
    email: 'alice.demo@test.local',
    phone: '+1-555-0001',
  },
  {
    medicaid_id: 'CO-DEMO-002',
    first_name: 'Bob',
    last_name: 'Builder',
    ssn_last_4: '5678',
    date_of_birth: '1990-07-22',
    address: {
      street: '456 Test Avenue',
      city: 'Aurora',
      state: 'CO',
      zip: '80012',
    },
    email: 'bob.demo@test.local',
    phone: '+1-555-0002',
  },
  {
    medicaid_id: 'CO-DEMO-003',
    first_name: 'Carol',
    last_name: 'Chen',
    ssn_last_4: '9012',
    date_of_birth: '1978-11-30',
    address: {
      street: '789 Sample Lane',
      city: 'Boulder',
      state: 'CO',
      zip: '80301',
    },
    email: 'carol.demo@test.local',
    phone: '+1-555-0003',
  },
];

interface DemoControlPanelProps {
  onSelectPerson?: (person: TestPerson) => void;
}

export const DemoControlPanel: React.FC<DemoControlPanelProps> = ({ onSelectPerson }) => {
  const [expanded, setExpanded] = useState(true);
  const [kbaStatuses, setKbaStatuses] = useState<Record<string, KBAStatus>>({});
  const [loading, setLoading] = useState(false);

  const fetchKBAStatus = async (medicaidId: string) => {
    try {
      const response = await fetch(
        `https://consent-backend-807576987550.us-central1.run.app/api/kba/status/${medicaidId}`
      );
      if (response.ok) {
        const data = await response.json();
        setKbaStatuses((prev) => ({ ...prev, [medicaidId]: data }));
      }
    } catch (error) {
      console.error(`Error fetching KBA status for ${medicaidId}:`, error);
    }
  };

  const refreshAllStatuses = async () => {
    setLoading(true);
    await Promise.all(TEST_PERSONS.map((person) => fetchKBAStatus(person.medicaid_id)));
    setLoading(false);
  };

  useEffect(() => {
    refreshAllStatuses();
  }, []);

  const handleSelectPerson = (person: TestPerson) => {
    if (onSelectPerson) {
      onSelectPerson(person);
    }
  };

  return (
    <Card
      sx={{
        mb: 3,
        border: '2px solid',
        borderColor: 'primary.main',
        backgroundColor: 'background.paper',
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonOutline color="primary" />
            <Typography variant="h6" color="primary">
              🎭 Demo Control Panel
            </Typography>
            <Chip label="PROTOTYPE" size="small" color="warning" />
          </Box>
          <Box display="flex" gap={1}>
            <IconButton onClick={refreshAllStatuses} disabled={loading} size="small">
              <Refresh />
            </IconButton>
            <IconButton onClick={() => setExpanded(!expanded)} size="small">
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Quick Test Users:</strong> Select a user below to auto-fill their credentials
              for testing the KBA verification flow.
            </Typography>
          </Alert>

          <Grid container spacing={2}>
            {TEST_PERSONS.map((person) => {
              const status = kbaStatuses[person.medicaid_id];
              const isLocked = status?.locked || false;
              const attempts = status?.attempts || 0;

              return (
                <Grid key={person.medicaid_id} size={{ xs: 12, md: 4 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 3,
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                        <Typography variant="h6" color="primary">
                          {person.first_name} {person.last_name}
                        </Typography>
                        {isLocked ? (
                          <Chip icon={<Error />} label="Locked" color="error" size="small" />
                        ) : (
                          <Chip
                            icon={<CheckCircle />}
                            label="Available"
                            color="success"
                            size="small"
                          />
                        )}
                      </Box>

                      <Divider sx={{ my: 1 }} />

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Medicaid ID
                        </Typography>
                        <Typography variant="body2" fontFamily="monospace">
                          {person.medicaid_id}
                        </Typography>

                        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                          SSN Last 4
                        </Typography>
                        <Typography variant="body2" fontFamily="monospace">
                          {person.ssn_last_4}
                        </Typography>

                        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                          Date of Birth
                        </Typography>
                        <Typography variant="body2" fontFamily="monospace">
                          {person.date_of_birth}
                        </Typography>

                        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                          ZIP Code
                        </Typography>
                        <Typography variant="body2" fontFamily="monospace">
                          {person.address.zip}
                        </Typography>

                        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                          Street Address
                        </Typography>
                        <Typography variant="body2" fontFamily="monospace">
                          {person.address.street}
                        </Typography>
                      </Box>

                      {attempts > 0 && !isLocked && (
                        <Alert severity="warning" sx={{ mb: 1 }}>
                          <Typography variant="caption">
                            {attempts} failed attempt{attempts > 1 ? 's' : ''}
                          </Typography>
                        </Alert>
                      )}

                      {isLocked && status?.message && (
                        <Alert severity="error" sx={{ mb: 1 }}>
                          <Typography variant="caption">{status.message}</Typography>
                        </Alert>
                      )}

                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleSelectPerson(person)}
                        disabled={isLocked}
                      >
                        Use This Person
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="caption" color="text.secondary">
            💡 <strong>2-of-4 Verification:</strong> You need to provide at least 2 fields, and at
            least 2 must match to verify identity.
          </Typography>
        </Collapse>
      </CardContent>
    </Card>
  );
};
