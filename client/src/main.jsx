import './index.css';

import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import store from './redux/store';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111118',
            color: '#e2e2f0',
            border: '1px solid #1e1e2e',
            fontFamily: 'DM Sans, sans-serif',
          },
          success: {
            iconTheme: { primary: '#b5ff3a', secondary: '#0a0a0f' },
          },
        }}
      />
    </BrowserRouter>
  </Provider>
);
