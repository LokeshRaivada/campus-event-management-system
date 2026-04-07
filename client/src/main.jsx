import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/design-system.css'
import './styles/forms.css'
import './styles/animations.css'
import './index.css'
import App from './App.jsx'

const root = document.getElementById('root');
createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
