import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import fetchWeather from '../api/weatherApi';

const Weather = () => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const temps = await fetchWeather("Santiago,CL"); // Espera a que la promesa se resuelva

      if (temps) { // Verifica que la respuesta no sea nula o indefinida
        setWeather({
          temp: temps.temp,
          tempMin: temps.tempMin,
          tempMax: temps.tempMax
        });
      }
    };

    fetchData(); // Llama a la función asincrónica
  }, []);

  return (
    <Box>
      {weather ? (
        <>
          <Typography variant="h6" component="h1">Santiago, Chile</Typography>
          <Typography variant="body1" component="p">Actual: {weather.temp} °C</Typography>
          <Typography variant="body2" component="p">Mínima: {weather.tempMin} °C</Typography>
          <Typography variant="body2" component="p">Máxima: {weather.tempMax} °C</Typography>
        </>
      ) : (
        <Typography variant="p" component="p">
            Cargando datos del clima...
        </Typography>
      )}
    </Box>
  );
};

export default Weather;
