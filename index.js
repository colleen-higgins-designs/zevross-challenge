mapboxgl.accessToken =
  'pk.eyJ1IjoiY29sbGVlbmpveSIsImEiOiJjazA1ajBpeWozcjFkM21tbDZncHZkMGQ1In0.25dDo49VXb3xqUUen-YE_w';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v9',
  center: [-97, 40],
  zoom: 4,
});

// get all wind turbines
const getAllTurbines = async () => {
  const response = await fetch(
    'http://files.zevross.org.s3-website-us-east-1.amazonaws.com/temp-geo/uswtdb_v2_1_20190715.geojson'
  );
  const data = await response.json();
  return data;
};

// store states with wind turbines, number of turbines, sum of capacity of turbines in the state

getAllTurbines()
  .then(turbines => {
    const turbinesInfoPerState = {};
    turbines.features.map(turbine => {
      const turbineState = turbine.properties.t_state;
      const turbineCapacity = turbine.properties.t_cap;
      const turbineCoords = turbine.geometry.coordinates;
      if (
        !['AK', 'HI'].includes(turbineState) &&
        turbinesInfoPerState[turbineState]
      ) {
        turbinesInfoPerState[turbineState].number++;
        turbinesInfoPerState[turbineState].capacity += turbineCapacity;
      } else if (!['AK', 'HI'].includes(turbineState)) {
        turbinesInfoPerState[turbineState] = {
          number: 1,
          capacity: turbineCapacity,
          coords: turbineCoords,
        };
      }
    });
    return turbinesInfoPerState;
  })
  .then(statesWithTurbines => {
    Object.keys(statesWithTurbines).map(state => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '32px';
      el.style.height = '39px';
      el.style.backgroundImage = 'url("marker-icon.png")';
      // add marker
      new mapboxgl.Marker(el)
        .setLngLat(statesWithTurbines[state].coords)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h3>${state} Details</h3><p>Number of Turbines: ${
              statesWithTurbines[state].number
            }</p><p>Total Turbine rated capacity in kilowatt (kW): ${
              statesWithTurbines[state].capacity
                ? statesWithTurbines[state].capacity
                : 'Not Rated'
            }</p>`
          )
        )
        .addTo(map);
    });
  });
