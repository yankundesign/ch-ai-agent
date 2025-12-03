import './App.css'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import AIAgentPage from './pages/AIAgentPage'
import '@momentum-design/fonts/dist/css/fonts.css';
import '@momentum-design/tokens/dist/css/components/complete.css';
import { ThemeProvider, IconProvider } from '@momentum-design/components/react'
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  return (
    <BrowserRouter>
      <ThemeProvider themeclass={`mds-theme-stable-${theme}Webex`}>
        <IconProvider iconSet='momentum-icons'>
          <MainLayout theme={theme} setTheme={setTheme}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/ai-agent" element={<AIAgentPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
        </IconProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
