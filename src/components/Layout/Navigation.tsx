import { Tabs, Tab, Paper } from '@mui/material';
import {
  Upload,
  TableChart,
  Label,
  SegmentOutlined,
  Calculate,
  Link,
  TextFields,
  AccountTree,
} from '@mui/icons-material';

export type TabValue = 'upload' | 'table' | 'concepts' | 'segments' | 'concept-mapping' | 'text-mapping' | 'account-catalog' | 'prorrateo';

interface NavigationProps {
  currentTab: TabValue;
  onChange: (tab: TabValue) => void;
}

const tabs = [
  { value: 'upload' as TabValue, label: 'Carga', icon: <Upload fontSize="small" /> },
  { value: 'table' as TabValue, label: 'Tabla', icon: <TableChart fontSize="small" /> },
  { value: 'concepts' as TabValue, label: 'Conceptos', icon: <Label fontSize="small" /> },
  { value: 'concept-mapping' as TabValue, label: 'Mapeo Código', icon: <Link fontSize="small" /> },
  { value: 'text-mapping' as TabValue, label: 'Mapeo Texto', icon: <TextFields fontSize="small" /> },
  { value: 'account-catalog' as TabValue, label: 'Catálogo Cuentas', icon: <AccountTree fontSize="small" /> },
  { value: 'segments' as TabValue, label: 'Segmentos', icon: <SegmentOutlined fontSize="small" /> },
  { value: 'prorrateo' as TabValue, label: 'Prorrateo', icon: <Calculate fontSize="small" /> },
];

/**
 * Navegación por pestañas
 * Permite cambiar entre las diferentes secciones de la aplicación
 */
export const Navigation = ({ currentTab, onChange }: NavigationProps) => {
  const handleChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    onChange(newValue);
  };

  return (
    <Paper elevation={1} sx={{ 
      borderRadius: 0,
      width: '100%',
    }}>
      <Tabs
        value={currentTab}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        textColor="primary"
        indicatorColor="primary"
        sx={{
          px: { xs: 2, sm: 3, md: 4, lg: 6 },
          width: '100%',
          maxWidth: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          '& .MuiTab-root': {
            minWidth: { xs: 100, sm: 120, md: 'auto' },
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            px: { xs: 1, sm: 2 },
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            icon={tab.icon}
            iconPosition="start"
          />
        ))}
      </Tabs>
    </Paper>
  );
};
