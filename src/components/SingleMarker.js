import { useStoreState, useStoreActions } from 'easy-peasy';
import MarkerSVG from './MarkerSVG';
import '../styles/markers.css';

const SingleMarker = ({ resort, urlRoot }) => {
  const { resortHoverName, toggleResortNames } = useStoreState(state => ({
    resortHoverName: state.resortHoverName,
    toggleResortNames: state.stored.toggleResortNames
  }));

  console.log("OpenWeather Key:", process.env.REACT_APP_OPENWEATHER_API_KEY);

  const { setSelectedResort, setCurrentWebcamLink, setResortHoverName, setCurrentWeatherData, setShowWeeklyWeather, setWeeklyWeatherData } = useStoreActions(actions => ({
    setSelectedResort: actions.setSelectedResort,
    setCurrentWebcamLink: actions.setCurrentWebcamLink,
    setResortHoverName: actions.setResortHoverName,
    setCurrentWeatherData: actions.setCurrentWeatherData,
    setShowWeeklyWeather: actions.setShowWeeklyWeather,
    setWeeklyWeatherData: actions.setWeeklyWeatherData
  }));

  const fetchCurrentWeatherData = async (lat, lon) => {
    try {
      const API_KEY = process.env.REACT_APP_WEATHERAPI_API;

      const res = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=1`
      );
      if (!res.ok) throw new Error('Error fetching current weather from WeatherAPI');

      const data = await res.json();

      // Current conditions
      const current = data.current;
      // Forecast for "today" (index 0)
      const today = data.forecast.forecastday[0].day;

      // Compose an object that matches your existing usage:
      setCurrentWeatherData({
        summary: current.condition.text,            // Short text like "Sunny", "Rain"
        icon: current.condition.icon,              // e.g. "//cdn.weatherapi.com/weather/64x64/day/113.png"
        feelsLike: current.feelslike_f,            // Feels-like temp in Fahrenheit
        maxTemp: today.maxtemp_f,                  // Daily high
        minTemp: today.mintemp_f,                  // Daily low
        restOfDay: today.condition.text,           // Reuse condition text or something else
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleResortClick = async (e, resort) => {
    e.preventDefault();
    setShowWeeklyWeather(false);
    setWeeklyWeatherData(null);
    setCurrentWeatherData(null);
    setSelectedResort(resort);
    fetchCurrentWeatherData(resort.geometry.coordinates[1], resort.geometry.coordinates[0])
  }

  const handleResortNamesHoverOrBtn = (target) => {
    setResortHoverName(target.parentNode.id);
    target.parentNode.style.setProperty("--resort-name", `"${target.parentNode.id}"`);

    let leftSki;
    let rightSki;

    if (target.tagName === 'DIV') {
      leftSki = target?.childNodes[0]?.childNodes[0];
      rightSki = target?.childNodes[0]?.childNodes[1];
    } else if (target.tagName === 'SVG') {
      leftSki = target?.childNodes[0];
      rightSki = target?.childNodes[1];
    }

    if (leftSki && rightSki) {
      leftSki.classList.remove('leftSkiTiltReset');
      rightSki.classList.remove('rightSkiTiltReset');
      leftSki.classList.add('leftSkiTilt');
      rightSki.classList.add('rightSkiTilt');
    }
  }

  const handleResortMarkerLeave = (target) => {
    setResortHoverName(target.parentNode.id);
    target.parentNode.style.setProperty("--resort-name", `"${target.parentNode.id}"`);

    let leftSki;
    let rightSki;

    if (target.tagName === 'DIV') {
      leftSki = target?.childNodes[0]?.childNodes[0];
      rightSki = target?.childNodes[0]?.childNodes[1];
    } else if (target.tagName === 'SVG') {
      leftSki = target?.childNodes[0];
      rightSki = target?.childNodes[1];
    }

    if (leftSki && rightSki) {
      leftSki.classList.remove('leftSkiTilt');
      rightSki.classList.remove('rightSkiTilt');
      leftSki.classList.add('leftSkiTiltReset');
      rightSki.classList.add('rightSkiTiltReset');
    }
  }

  return (
    <button
      onClick={(e) => {
        handleResortClick(e, resort);
        setCurrentWebcamLink(resort.properties.webcams);
      }}
      className={`
        markerBtn
        ${(resortHoverName === resort.properties.name) && !toggleResortNames ? 'showMarkerName' : ''}
        ${toggleResortNames ? 'showAllMarkerNames' : ''}
      `}
      id={resort.properties.name}
    >
      <MarkerSVG handleResortNamesHoverOrBtn={handleResortNamesHoverOrBtn} handleResortMarkerLeave={handleResortMarkerLeave} />
    </button>
  )
}

export default SingleMarker;
