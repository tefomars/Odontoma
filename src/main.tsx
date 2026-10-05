import React from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'

import App from './App'
import UiOverrideApplier from './components/UiOverrideApplier'
import { installZoomLock } from './lib/zoomLock'

import './index.css'

document.documentElement.classList.add("dark")
document.documentElement.dataset.odontomaApp = "true"
installZoomLock()

ReactDOM.createRoot(
  document.getElementById('root')!
).render(

  <React.StrictMode>
    <UiOverrideApplier />
    <div id="odontoma-original-ui"><App /></div>
    <Analytics />
  </React.StrictMode>

)
