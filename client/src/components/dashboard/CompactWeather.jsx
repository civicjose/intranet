import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiThunderstorm, WiNa } from 'react-icons/wi';

const CompactWeather = () => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async (url) => {
      try {
        const response = await axios.get(url);
        setWeather(response.data);
      } catch (error) { console.error(error); }
    };
    const getLocation = () => {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      const city = import.meta.env.VITE_WEATHER_CITY || 'Jaen,ES';
      if (!apiKey) return;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchWeather(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=${apiKey}&units=metric&lang=es`),
          () => fetchWeather(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=es`)
        );
      } else {
        fetchWeather(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=es`);
      }
    };
    getLocation();
  }, []);

  const getWeatherIcon = (main) => {
    const size = 28;
    switch (main) {
      case 'Clear': return <WiDaySunny size={size} />;
      case 'Clouds': return <WiCloudy size={size} />;
      case 'Rain': case 'Drizzle': return <WiRain size={size} />;
      case 'Thunderstorm': return <WiThunderstorm size={size} />;
      case 'Snow': return <WiSnow size={size} />;
      default: return <WiDaySunny size={size} />;
    }
  };

  if (!weather) return <div className="h-6 w-24 bg-white/20 rounded-md animate-pulse"></div>;

  return (
    // --- CORRECCIÓN: Usamos texto blanco para el contraste ---
    <div className="flex items-center gap-2 text-white/90">
      <span className="text-white">{getWeatherIcon(weather.weather[0].main)}</span>
      <span className="font-bold text-sm">{Math.round(weather.main.temp)}°C, {weather.name}</span>
    </div>
  );
};

export default CompactWeather;