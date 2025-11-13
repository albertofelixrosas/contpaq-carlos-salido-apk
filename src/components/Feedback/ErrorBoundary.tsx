import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary para capturar errores en componentes hijos
 * Muestra una UI amigable cuando ocurre un error inesperado
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: 'background.default',
            padding: 3,
          }}
        >
          <Paper
            sx={{
              maxWidth: 600,
              padding: 4,
              textAlign: 'center',
            }}
          >
            <ErrorOutline
              sx={{
                fontSize: 64,
                color: 'error.main',
                marginBottom: 2,
              }}
            />
            <Typography variant="h4" gutterBottom>
              ¡Oops! Algo salió mal
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Ha ocurrido un error inesperado en la aplicación.
            </Typography>
            {this.state.error && (
              <Paper
                variant="outlined"
                sx={{
                  padding: 2,
                  marginY: 2,
                  backgroundColor: 'grey.50',
                  textAlign: 'left',
                }}
              >
                <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                  {this.state.error.message}
                </Typography>
              </Paper>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleReset}
              sx={{ marginTop: 2 }}
            >
              Intentar de nuevo
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
