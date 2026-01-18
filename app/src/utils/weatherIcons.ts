// WMO Weather Code to Icon mapping
// Based on WMO Weather interpretation codes (WW)

export function getWeatherIcon(code: number): string {
  if (code === 0) {
    return '☀️'; // Clear sky
  }
  if (code >= 1 && code <= 3) {
    return '⛅'; // Partly cloudy
  }
  if (code >= 45 && code <= 48) {
    return '🌫️'; // Fog
  }
  if (code >= 51 && code <= 57) {
    return '🌧️'; // Drizzle
  }
  if (code >= 61 && code <= 67) {
    return '🌧️'; // Rain
  }
  if (code >= 71 && code <= 77) {
    return '🌨️'; // Snow
  }
  if (code >= 80 && code <= 82) {
    return '🌧️'; // Rain showers
  }
  if (code >= 95 && code <= 99) {
    return '⛈️'; // Thunderstorm
  }
  return '☀️'; // Default to clear
}

export function getWeatherDescription(code: number): string {
  if (code === 0) return 'Clear';
  if (code >= 1 && code <= 3) return 'Partly cloudy';
  if (code >= 45 && code <= 48) return 'Fog';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Clear';
}
