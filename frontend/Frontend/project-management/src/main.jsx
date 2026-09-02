import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './store/store.js'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { SocketProvider } from './contexts/SocketContext.jsx'

createRoot(document.getElementById('root')).render(
  
  <StrictMode>
    <SocketProvider>
    <ThemeProvider >
    <Provider store={store}>
    <BrowserRouter>
  
    <App />
    </BrowserRouter>
    </Provider>
    </ThemeProvider>
    </SocketProvider>
  </StrictMode>,
)
