import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '@/App'
import { startSettingsCache } from '@/lib/settingsCache'
import { warmUpSpeech } from '@/lib/speech'
import { warmUpNotificationSound } from '@/lib/notificationSound'
import '@/index.css'

startSettingsCache()
warmUpSpeech()
warmUpNotificationSound()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
