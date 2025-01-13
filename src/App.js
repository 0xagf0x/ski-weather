import React, { useEffect } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import { FlyToInterpolator } from 'react-map-gl';
import MapComponent from './components/MapComponent';
import WeeklyWeather from './components/WeeklyWeather';
import skiResorts from "./skiResorts.json";
import WebMercatorViewport from '@math.gl/web-mercator';
import './App.css';



const App = () => {
  
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const urlRoot = 'https://resort-forecast-api.herokuapp.com/ski-map';
  // const urlRoot = 'http://localhost:3001';
  const reverseGeocodingApiKey = '9bcc84879c614c1caf3675e356e7457c';
  let cancelTouch = false;
  let count = 0;

  const { weeklyWeatherData, showWeeklyWeather, selectedResort, toggleResortNames, toggleFavorites, darkMode, search, viewport, favorites, chetlerMode, intervalID } = useStoreState(state => ({
    weeklyWeatherData: state.weeklyWeatherData,
    showWeeklyWeather: state.showWeeklyWeather,
    selectedResort: state.selectedResort,
    toggleResortNames: state.stored.toggleResortNames,
    toggleFavorites: state.stored.toggleFavorites,
    darkMode: state.stored.darkMode,
    search: state.search,
    viewport: state.viewport,
    favorites: state.stored.favorites,
    chetlerMode: state.stored.chetlerMode,
    intervalID: state.stored.intervalID
  }));

  const { setSelectedResort, setWeeklyWeatherData, setShowWeeklyWeather, setToggleResortNames, setToggleFavorites, setDarkMode, setSearch, setViewport, setChetlerMode, setCurrentWeatherData, setIntervalID } = useStoreActions(actions => ({
    setSelectedResort: actions.setSelectedResort,
    setWeeklyWeatherData: actions.setWeeklyWeatherData,
    setShowWeeklyWeather: actions.setShowWeeklyWeather,
    setToggleResortNames: actions.setToggleResortNames,
    setToggleFavorites: actions.setToggleFavorites,
    setDarkMode: actions.setDarkMode,
    setSearch: actions.setSearch,
    setViewport: actions.setViewport,
    setChetlerMode: actions.setChetlerMode,
    setCurrentWeatherData: actions.setCurrentWeatherData,
    setIntervalID: actions.setIntervalID
  }));

  const zoomToResort = (e) => {
    const searchBar = document.querySelector('.resortSearch');
    const searchBarContainer = document.querySelector('.searchContainer');
    let newLatitude = viewport.latitude;
    let newLongitude = viewport.longitude;
    let zoom = viewport.zoom;

    if ((e.keyCode === 13) && (search.length)) {
      e.preventDefault();

      if ((search === 'bentchetler') && (!chetlerMode)) {
        searchBar.value = '';
        setSearch('');
        setChetlerMode(true);

        searchBarContainer.classList.add('chetlerModeActivated');
        setTimeout(() => {
          searchBarContainer.classList.remove('chetlerModeActivated');
        }, 3000)
      } else if ((search === 'nobentchetler') && (chetlerMode)) {
        searchBar.value = '';
        setSearch('');
        setChetlerMode(false);

        searchBarContainer.classList.add('chetlerModeDisabled');
        setTimeout(() => {
          searchBarContainer.classList.remove('chetlerModeDisabled');
        }, 3000)
      } else {
        for (let resort of skiResorts) {
          if (!toggleFavorites) {
            if (resort.properties.name.toLowerCase().includes(search.toLowerCase())) {
              newLatitude = resort.geometry.coordinates[1];
              newLongitude = resort.geometry.coordinates[0];
              zoom = 11;
              break;
            }
          } else if (favorites.includes(resort.properties.name)) {
            if (resort.properties.name.toLowerCase().includes(search.toLowerCase())) {
              newLatitude = resort.geometry.coordinates[1];
              newLongitude = resort.geometry.coordinates[0];
              zoom = 11;
              break;
            }
          }
        }
        searchBar.value = '';
        setSearch('');
        if(isMobileDevice) {
          searchBar.blur();
          setTimeout(() => {
            setViewport({
              ...viewport,
              width: '100%',
              height: '100%',
              latitude: newLatitude,
              longitude: newLongitude,
              zoom: zoom,
              transitionDuration: 1000,
              transitionInterpolator: new FlyToInterpolator()
            })
          }, 500)
        } else {
          setViewport({
            ...viewport,
            latitude: newLatitude,
            longitude: newLongitude,
            zoom: zoom,
            transitionDuration: 1000,
            transitionInterpolator: new FlyToInterpolator()
          })
        }
      }
    } else if ((e.keyCode === 13) && (!search.length)) {
      if (isMobileDevice) {
        searchBar.blur();
        setViewport({
          ...viewport,
          latitude: 38.9,
          longitude: -106.7,
          zoom: 6,
          transitionDuration: 1000,
          transitionInterpolator: new FlyToInterpolator()
        })
      } else {
        setViewport({
          ...viewport,
          latitude: 40.3,
          longitude: -99.2,
          zoom: 4,
          transitionDuration: 1000,
          transitionInterpolator: new FlyToInterpolator()
        })
      }
    } else if (e.ctrlKey && e.altKey) {
      setViewport({
        ...viewport,
        latitude: 39.1,
        longitude: -106.8,
        zoom: 7,
        transitionDuration: 1000,
        transitionInterpolator: new FlyToInterpolator()
      })
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', zoomToResort);

    return () => {
      document.removeEventListener('keydown', zoomToResort);
    }
  }, [search])
  

  const getLocationFromPixelCrds = (x, y) => {
    const viewportW = document.querySelector('.mapboxgl-map').getBoundingClientRect().width;
    const viewportH = document.querySelector('.mapboxgl-map').getBoundingClientRect().height;
    const viewport2 = new WebMercatorViewport({
      latitude: viewport.latitude,
      longitude: viewport.longitude,
      width: viewportW,
      height: viewportH,
      zoom: viewport.zoom
    });
    const clickCrds = viewport2.unproject([x, y]);
    return clickCrds;
  }

  const fetchAddressFromCrds = async (lon, lat) => {
    try {
      const res = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${reverseGeocodingApiKey}`, {
        "method": "GET"
      })
      if (!res.ok) {
        throw new Error('Error')
      }
      const address = await res.json();
      const city = address.features[0].properties.city ? address.features[0].properties.city : '';
      const county = (address.features[0].properties.county && !city) ? address.features[0].properties.county : '';
      const state = address.features[0].properties.state ? `${(city || county) ? ', ' : ''}${address.features[0].properties.state}` : '';
      const country = address.features[0].properties.country ? `, ${address.features[0].properties.country}` : '';
      const addressLine = (address.features[0].properties.address_line1 && city === '' && county === '' && state === '') ? address.features[0].properties.address_line1 : '';
      return `${city}${county}${state}${addressLine}${country}`;
    } catch(err) {
      console.log(err);
    }
  }

  const fetchRandomWeatherData = async (x, y) => {
    try {
      const crds =  await getLocationFromPixelCrds(x, y);
      setSelectedResort([crds[0], crds[1]]);
      if ((crds[1] >= -90) && (crds[1] <= 90) && (crds[0] >= -180) && (crds[0] <= 180)) {
        const res = await fetch(`${urlRoot}/scrapeCurrentWeather?lat=${crds[1]}&lon=${crds[0]}`);
        if (!res.ok) {
            throw new Error('Error')
        }
        const weather = await res.json();
        if (weather !== null) {
          const address = await fetchAddressFromCrds(crds[0], crds[1])
          await setCurrentWeatherData({...weather});
          setSelectedResort([crds[0], crds[1], address]);
        }
      }
    } catch(err) {
      console.log(err);
    }
  }

  const handleMapRightClick = async (e) => {
    if (e.target.classList.contains('overlays')) {      
      if (e.touches) {
        e.preventDefault();
        setShowWeeklyWeather(false);
        setWeeklyWeatherData(null);
        setCurrentWeatherData(null);
        fetchRandomWeatherData(e.touches[0].clientX, e.touches[0].clientY);
      } else {
        e.preventDefault();
        setShowWeeklyWeather(false);
        setWeeklyWeatherData(null);
        setCurrentWeatherData(null);
        fetchRandomWeatherData(e.clientX, e.clientY);
      }
    }
  }

  const handleScreenTouch = (e) => {
    setIntervalID(setInterval(() => {
      if ((count < 8) && !cancelTouch) {
        count += 1;
      } else if (!cancelTouch) {
        count = 0;
        handleMapRightClick(e);
        cancelTouch = true;
      }
    }, 50))
  }

  const handleScreenTouchEnd = () => {
    clearInterval(intervalID);
    cancelTouch = false;
    count = 0;
  }

  return (
    <div onClick={() => setShowWeeklyWeather(false)} className='container'>
      <div className={`mapContainer ${showWeeklyWeather ? 'blurMap' : null}`}>
        <div className={`settingsAndSearchContainer`}>
          <div className='settingsContainer'>
            <button
              onClick={() => setToggleResortNames()}
              className={`
                settingsBtn
                ${darkMode ? 'settingsBtnDark' : ''}
                ${toggleResortNames ? 'settingActive' : ''}
                ${(toggleResortNames && darkMode) ? 'settingActiveDark' : ''}
                ${!isMobileDevice ? 'settingsBtnHover' : ''}
                ${(!isMobileDevice && darkMode) ? 'settingsBtnDarkHover ' : ''}
                ${(!isMobileDevice && toggleResortNames) ? 'settingActiveHover ' : ''}
                ${(!isMobileDevice && toggleResortNames && darkMode) ? 'settingActiveDarkHover ' : ''}
              `}
            >
              Show Labels
            </button>
            <button
              onClick={() => setToggleFavorites()}
              className={`
                settingsBtn
                ${darkMode ? 'settingsBtnDark' : ''}
                ${toggleFavorites ? 'settingActive' : ''}
                ${(toggleFavorites && darkMode) ? 'settingActiveDark' : ''}
                ${!isMobileDevice ? 'settingsBtnHover' : ''}
                ${(!isMobileDevice && darkMode) ? 'settingsBtnDarkHover ' : ''}
                ${(!isMobileDevice && toggleFavorites) ? 'settingActiveHover ' : ''}
                ${(!isMobileDevice && toggleFavorites && darkMode) ? 'settingActiveDarkHover ' : ''}
              `}
            >
              Show Favorites
            </button>
            <button
              onClick={() => setDarkMode()}
              className={`
                settingsBtn
                ${darkMode ? 'settingsBtnDark settingActiveDark' : ''}
                ${!isMobileDevice ? 'settingsBtnHover' : ''}
                ${(!isMobileDevice && darkMode) ? 'settingsBtnDarkHover settingActiveDarkHover' : ''}
              `}
            >
              Dark Mode
            </button>
          </div>
          <div className='searchContainer'>
            <input
              onChange={(e) => setSearch(e.target.value)}
              className={`resortSearch ${darkMode ? 'resortSearchDark' : ''}`}
              type='text'
              placeholder='Filter Resorts'
            />
          </div>
        </div>
        <div 
          onTouchStart={(e) => isIOS ? handleScreenTouch(e) : null}
          onTouchEnd={isIOS ? handleScreenTouchEnd : null}
          onTouchMove={isIOS ? handleScreenTouchEnd: null}
          onContextMenu={(e) => !isIOS ? handleMapRightClick(e) : null} 
          className='map'>
          <MapComponent urlRoot={urlRoot} setWeeklyWeatherData={setWeeklyWeatherData} weeklyWeatherData={weeklyWeatherData}/>
        </div>
      </div>
      {
      showWeeklyWeather && selectedResort !== null
      ?
        <WeeklyWeather urlRoot={urlRoot} />
      :
      null
      }
    </div>
  );
}

export default App;