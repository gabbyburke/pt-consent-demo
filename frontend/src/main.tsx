import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, CssBaseline } from '@mui/material'
import './index.css'
import App from './App.tsx'
import theme from './theme.ts'
import { ActivityTimelineProvider } from './context/ActivityTimelineContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ActivityTimelineProvider>
        <App />
      </ActivityTimelineProvider>
    </ThemeProvider>
  </StrictMode>,
)
