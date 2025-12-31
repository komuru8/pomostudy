import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GameProvider } from './context/GameContext.jsx'
import { TaskProvider } from './context/TaskContext.jsx'
import { TimerProvider } from './context/TimerContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <GameProvider>
          <TaskProvider>
            <TimerProvider>
              <App />
            </TimerProvider>
          </TaskProvider>
        </GameProvider>
      </LanguageProvider>
    </AuthProvider>
  </StrictMode>,
)
