
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global handler for Google Maps authentication failures (like InvalidKeyMapError)
(window as any).gm_authFailure = () => {
  console.warn("Google Maps authentication failed. Switching to simplified tracking mode.");
  window.dispatchEvent(new CustomEvent('map-auth-failure'));
};

// Dynamically load Google Maps API
const loadGoogleMaps = () => {
  const apiKey = process.env.API_KEY;
  if (apiKey && !document.querySelector('script[src*="maps.googleapis.com"]')) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,visualization`;
    script.async = true;
    script.defer = true;
    // Add error handling for the script load itself
    script.onerror = () => {
      console.error("Failed to load Google Maps script.");
      window.dispatchEvent(new CustomEvent('map-load-error'));
    };
    document.head.appendChild(script);
  } else if (!apiKey) {
    console.warn("No API_KEY found for Google Maps.");
  }
};

// Handle generic script errors and cross-origin issues
window.onerror = (message, source, lineno, colno, error) => {
  console.error("Global Script Error:", { message, source, lineno, colno, error });
  return false; // Let default handler run
};

loadGoogleMaps();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
