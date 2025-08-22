import { useEffect, useState } from 'react';
import { Autocomplete, Box, TextField, Button } from '@mui/material';
import useLocalStorageState from 'use-local-storage-state';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import fetchWeather from '../api/weatherApi';
import SearchResult from './SearchResult';
import PropTypes from 'prop-types';

function Search({ isFavorite, onAddFavorite }) {
  const [inputValue, setInputValue] = useState('');
  const [city, setCity] = useState('');
  const [result, setResult] = useState(null);   // holds temps or null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');       // string for error message

  const [keywordList, setKeywordList] = useLocalStorageState('WeatherApp/Search/KeywordList', {
    defaultValue: []
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      setResult(null);
      const temps = await fetchWeather(city);
      if (temps) {
        setResult(temps);
        // Save successful query to history
        if (city && !keywordList.includes(city)) {
          setKeywordList([...keywordList, city]);
        }
      } else {
        setError('No se encontró la ciudad o hubo un problema al obtener el clima.');
      }
      setLoading(false);
    };

    if (city) {
      fetchData();
    }
    // Intentionally only depends on `city` to avoid re-fetch on keywordList update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  const handleSearch = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setError('Ingresa una ciudad para buscar.');
      setResult(null);
      return;
    }
    setCity(trimmed);
  };

  return (
    <>
      <Box sx={{ m: 2, maxWidth: 600, mx: 'auto', bgcolor: 'white' }}>
        <Autocomplete
          freeSolo
          options={keywordList}
          value={inputValue}
          onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar ciudad"
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
          )}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSearch}
          startIcon={<SearchIcon />}
          disabled={loading}
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </Button>
        {error && (
          <Box sx={{ mt: 1, color: 'error.main', fontSize: 14 }}>
            {error}
          </Box>
        )}
      </Box>

      {/* Only render SearchResult if there is a successful result */}
      {result && (
        <Box sx={{ m: 2, maxWidth: 600, mx: 'auto' }}>
          <SearchResult city={city} temps={result} />
          {typeof isFavorite === 'function' &&
            typeof onAddFavorite === 'function' &&
            !isFavorite(city) && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => onAddFavorite(city)}
                startIcon={<FavoriteIcon />}
                sx={{ mt: 2, width: '100%' }}
              >
                Agregar al Inicio
              </Button>
            )}
        </Box>
      )}
    </>
  );
}

Search.propTypes = {
  isFavorite: PropTypes.func.isRequired,
  onAddFavorite: PropTypes.func.isRequired,
};

export default Search;
