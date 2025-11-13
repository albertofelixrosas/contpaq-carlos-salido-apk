import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { Assessment } from '@mui/icons-material';

/**
 * Header principal de la aplicación
 * Muestra el logo y título
 */
export const Header = () => {
  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Toolbar sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Assessment sx={{ marginRight: { xs: 1, sm: 2 }, fontSize: { xs: 24, sm: 28 } }} />
        <Typography 
          variant="h6" 
          component="h1" 
          sx={{ 
            fontWeight: 600,
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
            flexGrow: 1,
          }}
        >
          Contpaq - Procesador de Datos APK/GG
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        {/* Aquí se puede agregar usuario/menú en el futuro */}
      </Toolbar>
    </AppBar>
  );
};
