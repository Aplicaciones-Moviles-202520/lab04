/* eslint-disable react/prop-types */
import { Card, CardContent, Typography } from '@mui/material';

// Simple presentational component for search results
const SearchResult = ({ city, temps }) => {
  if (!temps) return null;

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom>
          {city || temps.label}
        </Typography>

        {/* Actual */}
        {temps.temp && (
          <Typography variant="body1" component="p">
            Actual: {temps.temp} °C
          </Typography>
        )}

        {/* Pronosticadas para el resto del día */}
        {(temps.tempMinForecast || temps.tempMaxForecast) && (
          <Typography variant="body2" component="p">
            Mín. pronosticada hoy: {temps.tempMinForecast ?? '—'} °C — Máx. pronosticada hoy: {temps.tempMaxForecast ?? '—'} °C
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchResult;
