const fetch = require('node-fetch');

const map = document.getElementById('map');

// get all wind turbines
const getAllTurbines = async () => {
  const response = await fetch(
    'http://files.zevross.org.s3-website-us-east-1.amazonaws.com/temp-geo/uswtdb_v2_1_20190715.geojson'
  );
  const data = await response.json();
  // const stringData = JSON.stringify(data);
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
    statesWithTurbines.map(state => {
      // add marker
      const marker = new mapboxgl.Marker().setLngLat(state.coords).addTo(map);
    });
  });
