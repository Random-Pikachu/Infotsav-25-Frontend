import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {ReactLenis} from 'lenis/react'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReactLenis root options={{ lerp: 0.04}}>
      <App />
    </ReactLenis>
  </React.StrictMode>,
)
