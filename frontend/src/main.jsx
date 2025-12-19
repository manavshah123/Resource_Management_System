import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import App from './App';
import theme from './styles/theme';
import { BrandingProvider } from './context/BrandingContext';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrandingProvider>
          <App />
        </BrandingProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

