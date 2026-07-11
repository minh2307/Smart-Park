import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import { store } from './store';
import { createAppTheme } from '@shared/theme';
import { useAppSelector } from './store/hooks';
import { router } from './app/router';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PageLoader } from './components/PageLoader';
import 'react-toastify/dist/ReactToastify.css';

function AppContent() {
  const { mode } = useAppSelector((state) => state.theme);
  const theme = createAppTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <RouterProvider router={router} />
        </Suspense>
      </ErrorBoundary>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={mode}
      />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
