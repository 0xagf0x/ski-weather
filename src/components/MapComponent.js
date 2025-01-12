import React, { useEffect } from 'react';
import SingleMarker from './SingleMarker';
import SinglePopup from './SinglePopup';
import { useStoreState, useStoreActions } from 'easy-peasy';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import WebMercatorViewport from '@math.gl/web-mercator';
import skiResorts from "../skiResorts.json";
import 'mapbox-gl/dist/mapbox-gl.css';
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;


const MapComponent = ({ urlRoot }) => {
  const { selectedResort, viewport, toggleResortNames, favorites, toggleFavorites, darkMode, search } = useStoreState(state => ({
    selectedResort: state.selectedResort,
    viewport: state.viewport,
    toggleResortNames: state.stored.toggleResortNames,
    favorites: state.stored.favorites,
    toggleFavorites: state.stored.toggleFavorites,
    darkMode: state.stored.darkMode,
    search: state.search
  }));

  const { setSelectedResort, setViewport } = useStoreActions(actions => ({
    setSelectedResort: actions.setSelectedResort,
    setViewport: actions.setViewport
  }));

  const accessToken = 'pk.eyJ1IjoianRreWJlciIsImEiOiJja3g4YnNsMWMzNGhjMm9wMnlnZGg2NnR4In0.6FPRdpBZ28zeMHHihPYzLg';
  // const urlRoot = 'http://localhost:3001';

  useEffect(() => {
    const markers = document.querySelectorAll('.showAllMarkerNames');
    for (let marker of markers) {
      marker.style.setProperty("--resort-name", `"${marker.id}"`);
    }
  }, [toggleResortNames, toggleFavorites, search, viewport])

  const resizeViewport = () => {
    // const searchBar = document.querySelector('.resortSearch');
    const isMobile = ('ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/));
    if (!isMobile) {
      setViewport({
        ...viewport,
        width: '100%',
        height: '100%'
      })
    }
  }

  useEffect(() => {
    window.addEventListener('resize', resizeViewport);

    return () => {
      window.removeEventListener('resize', resizeViewport);
    }
  }, [])

  const markerVisible = (resort) => {
    if (document.querySelector('.mapboxgl-map')) {
      const viewportW = document.querySelector('.mapboxgl-map').getBoundingClientRect().width;
      const viewportH = document.querySelector('.mapboxgl-map').getBoundingClientRect().height;
      const viewport2 = new WebMercatorViewport({
        latitude: viewport.latitude,
        longitude: viewport.longitude,
        width: viewportW,
        height: viewportH,
        zoom: viewport.zoom
      });
      const pixelCrds = viewport2.project([resort.geometry.coordinates[0], resort.geometry.coordinates[1]]);
      if ((pixelCrds[0] > -50) && (pixelCrds[0] < (viewportW + 50)) && (pixelCrds[1] > -15) && (pixelCrds[1] < (viewportH + 50))) {
        return true;
      } else return false;
    }
    return false;
  }

  return (
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={accessToken}
        mapStyle={
          !darkMode
          ? `mapbox://styles/jtkyber/ckxdnbiug3mua14nva7s2ehy7`
          : `mapbox://styles/jtkyber/ckx8ff5ll089g14nvynn2vgk4`
        }
        onViewportChange={(viewport => {
          setViewport(viewport)
        })}
        dragRotate = {false}
      >
      {
        !toggleFavorites
        ?
        skiResorts.reduce((temp, resort) => {
          if (resort.properties.name.toLowerCase().includes(search.toLowerCase())) {
            if (markerVisible(resort)) {
              temp.push (
                <Marker key={resort.properties.name} latitude={resort.geometry.coordinates[1]} longitude={resort.geometry.coordinates[0]}>
                  <SingleMarker urlRoot={urlRoot} resort={resort} />
                </Marker>
              )
            }
          } 
          return temp;
        }, [])
        :
        skiResorts.reduce((temp, resort) => {
          if (favorites.includes(resort.properties.name)) {
            if (resort.properties.name.toLowerCase().includes(search.toLowerCase())) {
              if (markerVisible(resort)) {
                temp.push(
                  <Marker key={resort.properties.name} latitude={resort.geometry.coordinates[1]} longitude={resort.geometry.coordinates[0]}>
                    <SingleMarker urlRoot={urlRoot} resort={resort} />
                  </Marker>
                )
              }
            }
          }
          return temp;
        }, [])
      }
      {
        selectedResort
        ?
        <Popup
          latitude={selectedResort?.properties?.name ? selectedResort.geometry.coordinates[1] : selectedResort[1]}
          longitude={selectedResort?.properties?.name ? selectedResort.geometry.coordinates[0] : selectedResort[0]}
          onClose={() => {
            setSelectedResort(null);
          }}
        >
          <SinglePopup urlRoot={urlRoot} />
        </Popup>
        :
        null
      }
      </ReactMapGL>
  );
}

export default MapComponent;
