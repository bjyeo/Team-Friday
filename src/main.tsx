import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { installMetricsConsoleHook, markSessionStart } from './lib/metrics'
import './styles/tokens.css'

markSessionStart()
installMetricsConsoleHook()

const root = document.getElementById('root')
if (!root) throw new Error('#root is missing from index.html')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
