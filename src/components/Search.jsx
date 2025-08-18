import { useEffect, useState } from 'react';
import { Button, TextField, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import fetchWeather from '../api/weatherApi';
import SearchResult from './SearchResult';

function Search() {
  const [inputValue, setInputValue] = useState('');
  const [city, setCity] = useState('');
  const [result, setResult] = useState(null);   // holds temps or null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');       // string for error message

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      setResult(null);
      const temps = await fetchWeather(city);
      if (temps) {
        setResult(temps);
      } else {
        setError('No se encontró la ciudad o hubo un problema al obtener el clima.');
      }
      setLoading(false);
    };

    if (city) {
      fetchData();
    }
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
        <TextField
          label="Buscar ciudad"
          variant="outlined"
          fullWidth
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          sx={{ mb: 2 }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
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
      {result && <SearchResult city={city} temps={result} />}
    </>
  );
}

export default Search;
