import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { CssBaseline } from '@mui/material'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from "react-router-dom"
import "./index.css";
import { Toaster } from 'sonner'
import { persistor, store } from './Redux/store.js'
import { Provider } from "react-redux"
import { PersistGate } from 'redux-persist/integration/react'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <HelmetProvider>
          <CssBaseline />
          <PersistGate loading={null} persistor={persistor}>
            <App />

          </PersistGate>
          <Toaster duration={4000} position="bottom-right" richColors />
        </HelmetProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
