import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from './theme/theme';
import { ErrorBoundary } from './components/Feedback/ErrorBoundary';
import { AppLayout } from './components/Layout/AppLayout';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <AppLayout>
          {(currentTab) => (
            <div>
              <h2>Pestaña actual: {currentTab}</h2>
              <p>Implementación de features en próximas fases...</p>
            </div>
          )}
        </AppLayout>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
