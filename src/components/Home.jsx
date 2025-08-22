import { useEffect, useState } from 'react';
import { Tabs, Tab, Box, Button, Typography } from '@mui/material';
import Weather from './Weather';
import PropTypes from 'prop-types';
import DeleteIcon from '@mui/icons-material/Delete';

function Home({ favorites, removeFavorite }) {
  const [selectedTab, setSelectedTab] = useState(0);

  // Cuando cambia la lista de favoritos, ajusta el índice seleccionado
  useEffect(() => {
    if (favorites.length === 0) {
      // Sin tabs: no renderizamos Tabs/TabPanels, mostramos estado vacío
      return;
    }
    if (selectedTab >= favorites.length) {
      setSelectedTab(favorites.length - 1);
    }
    // Si se eliminó una pestaña anterior a la seleccionada,
    // el mismo índice ahora apunta a la siguiente ciudad (válido).
  }, [favorites.length, selectedTab, favorites]);

  const handleTabChange = (_event, newValue) => {
    setSelectedTab(newValue);
  };

  // Estado vacío
  if (favorites.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          No tienes ciudades en Inicio
        </Typography>
        <Typography variant="body2">
          Agrega ciudades desde la vista <strong>Buscar</strong>.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        aria-label="city tabs"
        variant="scrollable"
        scrollButtons="auto"
      >
        {favorites.map((location) => (
          <Tab key={location} label={location} />
        ))}
      </Tabs>

      {favorites.map((location, index) => (
        <Box
          key={location}
          role="tabpanel"
          hidden={selectedTab !== index}
          id={`tabpanel-${index}`}
          aria-labelledby={`tab-${index}`}
          sx={{ p: 3 }}
        >
          {selectedTab === index && (
            <Box>
              <Weather location={location} />
              <Button
                variant="contained"
                color="secondary"
                onClick={() => removeFavorite(location)}
                sx={{ mt: 2 }}
                startIcon={<DeleteIcon />}
              >
                Quitar
              </Button>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}

Home.propTypes = {
  favorites: PropTypes.arrayOf(PropTypes.string).isRequired,
  removeFavorite: PropTypes.func.isRequired,
};

export default Home;
