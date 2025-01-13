/* eslint-disable import/first */
// index.js (at the very top, BEFORE any other imports!)
(() => {
  // Save the original ResizeObserver
  const OriginalResizeObserver = window.ResizeObserver;

  class PatchedResizeObserver extends OriginalResizeObserver {
    constructor(callback) {
      super((entries, observer) => {
        try {
          callback(entries, observer);
        } catch (err) {
          // Check for either Chrome message
          if (
            err.message.includes('ResizeObserver loop limit exceeded') ||
            err.message.includes('ResizeObserver loop completed with undelivered notifications')
          ) {
            return;
          }
          // Otherwise rethrow
          throw err;
        }
      });
    }
  }

  // Override the global ResizeObserver
  window.ResizeObserver = PatchedResizeObserver;
})();

// Now continue with your normal index.js imports & code
import React from 'react';
import ReactDOM from 'react-dom';
import { StoreProvider, createStore } from 'easy-peasy';
import model from './model';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Create store, etc.
const store = createStore(model);

ReactDOM.render(
  <StoreProvider store={store}>
    <App />
  </StoreProvider>,
  document.getElementById('root')
);

reportWebVitals();