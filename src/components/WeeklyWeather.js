import React, { useEffect } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import '../styles/weeklyWeather.css';

const WeeklyWeather = ({ urlRoot }) => {
  const { 
    selectedResort, 
    weeklyWeatherData, 
    openSnowLink, 
    snowForecastLink, 
    chetlerMode, 
    currentWeatherData 
  } = useStoreState(state => ({
    selectedResort: state.selectedResort,
    weeklyWeatherData: state.weeklyWeatherData,
    openSnowLink: state.openSnowLink,
    snowForecastLink: state.snowForecastLink,
    chetlerMode: state.stored.chetlerMode,
    currentWeatherData: state.currentWeatherData
  }));

  const { setOpenSnowLink, setSnowForecastLink } = useStoreActions(actions => ({
    setOpenSnowLink: actions.setOpenSnowLink,
    setSnowForecastLink: actions.setSnowForecastLink
  }));

  useEffect(() => {
    const map = document.querySelector('.mapContainer');
    const wWeather = document.querySelector('.weeklyWeatherContainer');

    const scale = Math.min(
      map.offsetWidth / wWeather.offsetWidth,
      map.offsetHeight / wWeather.offsetHeight,
    );

    if (map.offsetWidth < 560) {
      wWeather.style.setProperty('--weekly-weather-scale', `${scale * 0.9}`);
    }
    if (map.offsetHeight < 560) {
      wWeather.style.setProperty('--weekly-weather-scale', `${scale * 0.8}`);
    }
  }, []);

  useEffect(() => {
    setOpenSnowLink(null);
    setSnowForecastLink(null);
    if (selectedResort?.properties?.name) {
      fetchSnowForcast(selectedResort.properties.name);
      // fetchOpenSnow(selectedResort.properties.name);
    }
  }, []);

  const fetchSnowForcast = async () => {
    try {
      const name = selectedResort.properties.name;
      const res = await fetch(`${urlRoot}/scrapeSnowForecast?name=${name}`);
      if (!res.ok) {
        throw new Error('Error');
      }
      const url = await res.json();
      setSnowForecastLink(url);
    } catch(err) {
      console.log(err);
    }
  };

  const fetchOpenSnow = async () => {
    try {
      const name = selectedResort.properties.name;
      const res = await fetch(`${urlRoot}/scrapeOpenSnow?name=${name}`);
      if (!res.ok) {
        throw new Error('Error');
      }
      const url = await res.json();
      setOpenSnowLink(url);
    } catch(err) {
      console.log(err);
    }
  };

  // If no weekly weather data yet, show loading or placeholder
  if (!weeklyWeatherData) {
    return (
      <div className='weeklyWeatherContainer'>
        <h3>Loading weekly forecast...</h3>
      </div>
    );
  }

  return (
    <div className='weeklyWeatherContainer'>
      <div className={`${chetlerMode ? 'chetlerMode' : ''}`}></div>

      <h2 className='weeklyWeatherResortName'>
        {selectedResort?.properties?.name ? selectedResort.properties.name : selectedResort[2]} Weekly Forecast
      </h2>

      <div className='weeklyWeather'>
        {
          /* 
            weeklyWeatherData should be an ARRAY, e.g.:
            [
              {
                date: "2025-01-12",
                day: {
                  maxtemp_f: 25.0,
                  mintemp_f: 10.5,
                  condition: {
                    text: "Partly cloudy",
                    icon: "//cdn.weatherapi.com/..."
                  }
                },
                // ...
              },
              { ...another day... },
              ...
            ]
          */
          weeklyWeatherData.map((dayObj, index) => {
            // dayObj.date might be "2025-01-12"
            // dayObj.day.maxtemp_f, dayObj.day.mintemp_f, dayObj.day.condition.icon, etc.
            const date = dayObj.date;
            const highF = dayObj.day.maxtemp_f;
            const lowF = dayObj.day.mintemp_f;
            const conditionText = dayObj.day.condition.text;
            const iconUrl = dayObj.day.condition.icon.startsWith('//')
              ? 'https:' + dayObj.day.condition.icon
              : dayObj.day.condition.icon;

            return (
              <div key={date + index} className='weeklyWeatherRow'>
                <h3>{date}:</h3>
                <div className='weeklyWeatherImg'>
                  <img src={iconUrl} alt={conditionText} />
                </div>
                <h3>High: {highF}°F</h3>
                <h3>Low: {lowF}°F</h3>
                {/* Optionally show condition text: */}
                <h4>{conditionText}</h4>
              </div>
            );
          })
        }
      </div>

      {selectedResort?.properties?.name ? (
        <>
          <a
            className='detailedSnowForecast'
            href={snowForecastLink}
            target='_blank'
            rel='noopener noreferrer'
          >
            ❄️<span className='detailedSnowForecastText'>Detailed Snow Forecast</span>❄️
          </a>
        </>
      ) : (
        <a
          className='detailedSnowForecast'
          href={currentWeatherData.darkSkyUrl} // Possibly remove or replace
          target='_blank'
          rel='noopener noreferrer'
        >
            🌩️<span className='detailedSnowForecastText'>Detailed Snow Forecast</span>🌩️
        </a>
      )}
    </div>
  );
};

export default WeeklyWeather;