import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { Assessment } from '@mui/icons-material';

/**
 * Header principal de la aplicación
 * Muestra el logo y título
 */
export const Header = () => {
  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Toolbar>
        <Assessment sx={{ marginRight: 2, fontSize: 28 }} />
        <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
          Contpaq - Procesador de Datos APK/GG
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        {/* Aquí se puede agregar usuario/menú en el futuro */}
      </Toolbar>
    </AppBar>
  );
};
