import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './index.css';

const App = () => {
  const [theme, setTheme] = useState('light');
  const [savedCities, setSavedCities] = useState(() => {
    const saved = localStorage.getItem('savedCities');
    return saved ? JSON.parse(saved) : [];
  });
  const [city, setCity] = useState('');
  const [cityOptions, setCityOptions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [savedCityWeather, setSavedCityWeather] = useState(null);

  const API_KEY = '3a7b2ec772a757bbe0f4389a9a6ff053'; // Replace with your actual API key.

  useEffect(() => {
    localStorage.setItem('savedCities', JSON.stringify(savedCities));
  }, [savedCities]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const searchCity = async () => {
    if (!city.trim()) {
      setError('Please enter a valid city name.');
      return;
    }

    try {
      const geoResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${API_KEY}`
      );

      if (geoResponse.data.length === 0) {
        setError('City not found! Please try again.');
        return;
      }

      setCityOptions(geoResponse.data);
      setError('');
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError('An error occurred. Please try again.');
    }
  };

  const fetchWeather = async (cityData) => {
    try {
      const { lat, lon, name, country } = cityData;
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      setWeather({
        name: `${name}, ${country}`,
        ...weatherResponse.data,
      });
      setError('');
      setCityOptions([]);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError('An error occurred. Please try again.');
      setWeather(null);
    }
  };

  const fetchSavedCityWeather = async (cityData) => {
    try {
      const { lat, lon, name, country } = cityData;
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      setSavedCityWeather({
        name: `${name}, ${country}`,
        ...weatherResponse.data,
      });
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError('An error occurred. Please try again.');
      setSavedCityWeather(null);
    }
  };

  const saveCity = () => {
    if (selectedCity && !savedCities.some((c) => c.name === selectedCity.name)) {
      setSavedCities([...savedCities, selectedCity]);
    }
  };

  const deleteCity = (cityToDelete) => {
    setSavedCities(savedCities.filter((c) => c.name !== cityToDelete.name));
  };

  const clearWeather = () => {
    setWeather(null);
    setError('');
    setCity('');
    setCityOptions([]);
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-base-100">
        {/* Sidebar */}
        <div className="w-64 bg-base-200 p-6 shadow-lg">
          <nav>
            <h2 className="text-2xl font-bold mb-6 text-center">Weather App</h2>
            <ul className="menu">
              <li className="mb-4">
                <Link to="/" className="btn btn-ghost w-full">Home</Link>
              </li>
              <li>
                <Link to="/saved" className="btn btn-ghost w-full">Saved Cities</Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <button
            onClick={toggleTheme}
            className="btn btn-ghost absolute right-6 top-6 text-2xl"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <Routes>
            {/* Home Section */}
            <Route
              path="/"
              element={
                <div>
                  <h1 className="text-4xl font-bold mb-6 text-center">Check the Weather</h1>
                  <div className="flex justify-center items-center mb-6">
                    <input
                      type="text"
                      placeholder="Enter city name"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="input input-bordered w-full max-w-md"
                    />
                    <button
                      onClick={searchCity}
                      className="btn btn-primary ml-4"
                    >
                      Search
                    </button>
                    <button
                      onClick={saveCity}
                      className="btn btn-primary ml-4"
                    >
                      Save City
                    </button>
                    <button
                      onClick={clearWeather}
                      className="btn btn-secondary ml-4"
                    >
                      Clear Data
                    </button>
                  </div>
                  {error && <p className="text-red-500 text-center">{error}</p>}

                  {cityOptions.length > 0 && (
                    <div className="bg-base-200 p-6 rounded-lg shadow-lg max-w-md mx-auto">
                      <h2 className="text-xl font-bold mb-4 text-center">Select Your City</h2>
                      <ul>
                        {cityOptions.map((option, index) => (
                          <li
                            key={index}
                            className="cursor-pointer hover:bg-base-300 p-2 rounded"
                            onClick={() => {
                              setSelectedCity(option);
                              fetchWeather(option);
                            }}
                          >
                            {option.name}, {option.state || ''} {option.country}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {weather && (
                    <div className="bg-base-200 p-6 rounded-lg shadow-lg max-w-md mx-auto mt-6">
                      <h2 className="text-2xl font-bold mb-4 text-center">{weather.name}</h2>
                      <p className="text-lg">🌡️ Temperature: {weather.main.temp}°C</p>
                      <p className="text-lg">🌤️ Weather: {weather.weather[0].description}</p>
                      <p className="text-lg">💧 Humidity: {weather.main.humidity}%</p>
                      <p className="text-lg">🌬️ Wind Speed: {weather.wind.speed} m/s</p>
                    </div>
                  )}
                </div>
              }
            />

            {/* Saved Cities Section */}
            <Route
              path="/saved"
              element={
                <div>
                  <h1 className="text-4xl font-bold mb-6 text-center">Saved Cities</h1>
                  {savedCities.length === 0 ? (
                    <p className="text-center text-gray-500">No cities saved yet.</p>
                  ) : (
                    <ul className="space-y-4 max-w-md mx-auto">
                      {savedCities.map((city, index) => (
                        <li
                          key={index}
                          className="flex flex-col bg-base-200 p-4 rounded-lg shadow space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className="font-medium cursor-pointer"
                              onClick={() => fetchSavedCityWeather(city)}
                            >
                              {city.name}
                            </span>
                            <button
                              onClick={() => deleteCity(city)}
                              className="btn btn-error btn-sm"
                            >
                              Delete
                            </button>
                          </div>

                          {/* Display Weather Details */}
                          {savedCityWeather && savedCityWeather.name === city.name && (
                            <div className="bg-base-100 p-4 rounded-lg shadow">
                              <h2 className="text-lg font-bold mb-2 text-center">
                                {savedCityWeather.name}
                              </h2>
                              <p>🌡️ Temperature: {savedCityWeather.main.temp}°C</p>
                              <p>🌤️ Weather: {savedCityWeather.weather[0].description}</p>
                              <p>💧 Humidity: {savedCityWeather.main.humidity}%</p>
                              <p>🌬️ Wind Speed: {savedCityWeather.wind.speed} m/s</p>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              }
            />

          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
