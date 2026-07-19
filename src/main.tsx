import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import App from './App.tsx'
import Keystatic from './Keystatic.tsx'

const isKeystatic = window.location.pathname.startsWith('/keystatic');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isKeystatic ? <Keystatic /> : <App />}
  </StrictMode>,
)
