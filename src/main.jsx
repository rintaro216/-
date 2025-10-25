import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LiffProvider } from './contexts/LiffContext'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LiffProvider>
        <App />
      </LiffProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
