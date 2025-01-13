import React, { useEffect } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import CurrentWeather from './CurrentWeather';
import '../styles/popup.css';

const SinglePopup = ({ urlRoot }) => {
  const { selectedResort, currentWebcamLink, favorites, darkMode, currentWeatherData } = useStoreState(state => ({
    selectedResort: state.selectedResort,
    currentWebcamLink: state.currentWebcamLink,
    favorites: state.stored.favorites,
    darkMode: state.stored.darkMode,
    currentWeatherData: state.currentWeatherData
  }));

  const { setShowWeeklyWeather, setWeeklyWeatherData, addToFavorites, removeFromFavorites } = useStoreActions(actions => ({
    setShowWeeklyWeather: actions.setShowWeeklyWeather,
    setWeeklyWeatherData: actions.setWeeklyWeatherData,
    addToFavorites: actions.addToFavorites,
    removeFromFavorites: actions.removeFromFavorites
  }));

  useEffect(() => {
    const popup = document.querySelector('.mapboxgl-popup-content');
    if (darkMode) {
      popup.style.border = '3px solid white';
    } else {
      popup.style.border = '3px solid black';
    }
  }, [darkMode])

  const fetchWeeklyWeatherData = async (lat, lon) => {
    try {
      if (currentWeatherData) {
        // Use WeatherAPI's forecast endpoint
        const API_KEY = process.env.REACT_APP_WEATHERAPI_API_KEY;
        // e.g. 7 days of forecast
        const res = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=7`
        );

        if (!res.ok) {
          throw new Error('Error fetching weekly forecast');
        }

        const data = await res.json();

        // WeatherAPI returns forecast data in `data.forecast.forecastday` 
        // (an array of daily forecasts).
        // You can store the entire data or just the `forecastday` array.
        setWeeklyWeatherData(data.forecast.forecastday);
        setShowWeeklyWeather(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className='popup' >
      {
      selectedResort?.properties?.name
      ?
      <div className={`favoritesBtnAndName ${darkMode ? 'favoritesBtnAndNameDark' : ''}`}>
        <button
          onClick={() => {
            if (!favorites.includes(selectedResort.properties.name)) {
              addToFavorites(selectedResort.properties.name);
            } else {
              removeFromFavorites(selectedResort.properties.name);
            }
          }}
          className={`favoritesBtn ${!favorites.includes(selectedResort.properties.name) ? 'addToFavorites' : 'removeFromFavorites'}`}>
            <h3>{`${!favorites.includes(selectedResort.properties.name) ? '+' : '-'}`}</h3>
        </button>
        <h2 className='popupName'>{selectedResort.properties.name}</h2>
      </div>
      : 
        selectedResort[2]
        ?
        <div className={`favoritesBtnAndName ${darkMode ? 'favoritesBtnAndNameDark' : ''}`}>
          <h4 className='popupName'>{selectedResort[2]}</h4>
        </div>
        : 
        <div className={`favoritesBtnAndNameLoading ${darkMode ? 'favoritesBtnAndNameDark' : ''}`}>
          <div className='popupNameLoading'></div>
          <div className='popupNameLoading2'></div>
        </div>
      }
      <CurrentWeather />
      <div className='weeklyForcastWebcamBtnContainer'>
        <button
          onClick={() => fetchWeeklyWeatherData(selectedResort?.properties?.name ? selectedResort.geometry.coordinates[1] : selectedResort[1], selectedResort?.properties?.name ? selectedResort.geometry.coordinates[0] : selectedResort[0])}
          className={`weeklyWeatherBtn ${darkMode ? 'weeklyWeatherBtnDark' : ''}`}>Weekly Forecast
        </button>
        
        {
       currentWebcamLink
        ?
        <button className={`webcamLink ${darkMode ? 'webcamLinkDark' : ''}`}>
          <a href={currentWebcamLink} target='_blank' rel='noopener noreferrer'>Webcams</a>
        </button>
        : null
        }
      </div>
    </div>
  );
}

export default SinglePopup;
