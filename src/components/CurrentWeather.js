import { useEffect } from 'react';
import { useStoreState } from 'easy-peasy';
import '../styles/currentWeather.css';

const CurrentWeather = () => {
  const { currentWeatherData } = useStoreState((state) => ({
    currentWeatherData: state.currentWeatherData,
  }));

  useEffect(() => {
    console.log('currentWeatherData', currentWeatherData);
  }, [currentWeatherData]);

  // Show a loading or placeholder UI if we have no weather data
  if (!currentWeatherData) {
    return (
      <div className='currentWeatherContainerLoading'>
        <div className='currentSummaryRow'>
          <div className='loadingCurWeatherImg'></div>
          <div className='loadingCurWeatherSummary'></div>
        </div>
        <div className='highLowRow'>
          <div className='loadingCurWeatherLow'></div>
          <div className='loadingCurWeatherFeelsLike'></div>
          <div className='loadingCurWeatherHigh'></div>
        </div>
        <div className='restOfDay'>
          <div className='loadingCurWeatherRestOfDay'></div>
          <div className='loadingCurWeatherRestOfDay2'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='currentWeatherContainer'>
      <div className='currentSummaryRow'>
        {/* WeatherAPI returns an icon URL like "//cdn.weatherapi.com/weather/64x64/day/113.png". 
            If it starts with "//", prefix with "https:". */}
        <img 
          className='currentImg'
          src={
            currentWeatherData.icon.startsWith('//') 
              ? 'https:' + currentWeatherData.icon
              : currentWeatherData.icon
          }
          alt='Weather'
        />
        <h3 className='restOfDay'>Today: {currentWeatherData.restOfDay}</h3>
        
        {/* Brief description, e.g., "Sunny", "Partly cloudy" */}
        <h3>{currentWeatherData.condition}</h3>
      </div>

      <div className='highLowRow'>
        <div className='highLowRow-item'>Low: {currentWeatherData.minTemp}°F</div>
        <div className='highLowRow-item'>Current: {currentWeatherData.feelsLike}°F</div>
        <div className='highLowRow-item'>High: {currentWeatherData.maxTemp}°F</div>
      </div>
      
      {/* "Rest of Day" text: you can call it a summary or forecast text. */}
    
    </div>
  );
};

export default CurrentWeather;