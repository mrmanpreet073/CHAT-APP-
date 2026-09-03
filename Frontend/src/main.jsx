import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { CssBaseline } from '@mui/material'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from "react-router-dom"
import "./index.css";
import { Toaster } from 'sonner'
import { store } from './Redux/store.js'
import {Provider} from "react-redux"


createRoot(document.getElementById('root')).render(
  <StrictMode>
   <Provider store={store}>
     <BrowserRouter>
      <HelmetProvider>
        <CssBaseline />
        <App />
        <Toaster duration={4000} position="bottom-right" richColors />
      </HelmetProvider>
    </BrowserRouter>
   </Provider>
  </StrictMode>,
)
