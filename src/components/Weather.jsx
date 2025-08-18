import { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography } from '@mui/material';

const Weather = () => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY; // Acceder a la variable de entorno

    const fetchWeather = async () => {
      try {
        // Paso 1: Obtener coordenadas de Santiago de Chile
        const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=Santiago,CL&limit=1&appid=${apiKey}`;
        const geocodeResponse = await axios.get(geocodeUrl);
        const { lat, lon } = geocodeResponse.data[0];

        // Paso 2: Usar coordenadas para obtener el clima actual
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        const weatherResponse = await axios.get(weatherUrl);
        const { temp, temp_min, temp_max } = weatherResponse.data.main;

        setWeather({
          temp: temp.toFixed(1),
          tempMin: temp_min.toFixed(1),
          tempMax: temp_max.toFixed(1)
        });
      } catch (error) {
        console.error('Failed to fetch weather data:', error);
      }
    };

    fetchWeather();
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
