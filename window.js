const GbfsClient = require('gbfs-client');
const gbfsClient = new GbfsClient();

// JQuery runs this after the page has loaded
// Alternate syntax for:  $(document).ready(function(){
$(function () {
  // Get the list of stations
  gbfsClient.stationInfo()
    .then(stations => {
      // Sort the stations by name
      stations.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      })
      // Put together an array of HTML options
      var options = []
      for (var station of stations) {
        options.push(
          `<option value=${station.station_id}>
            ${station.name}
          </option>`
        )
      }
      // Add the HTML to the DOM
      $('#add-a-station').html(`
        <form>
          <select class="form-control">
            ${options.join(' ')}
          </select>
        </form>
      `);
      // Add the change handler
      $('#add-a-station').change(function() {
        createStation($('#add-a-station option:selected').val())
      });
    })
    .catch(err => $('#add-a-station').text(`Error: ${err.message}`));

  let activeStations = [];
  function refreshStationStatus(stationId) {
    gbfsClient.stationStatus(stationId)
      .then(station => {
      $('#' + getElementId(ID_STATION_BIKES_AVAIL, stationId)).text(station.num_bikes_available);
    }).catch(err => {
      $('#' + getElementId(ID_STATION_BIKES_AVAIL, stationId)).text(`Error! ${err.message}`);
    })
  }
  function refreshAllStationStatus() {
    for (let stationId of activeStations) {
      refreshStationStatus(stationId);
      $('#last-update').text(`updated ${new Date().toLocaleTimeString()}`);
    }
  }
  $('#last-update').click(refreshAllStationStatus);

  // Refresh stations every 10s
  setInterval(refreshAllStationStatus, 10000);

  // So this is why people use react / vue?
  const ID_STATION = 'station';
  const ID_STATION_WRAP = 'station-wrap';
  const ID_STATION_NAME = 'station-name';
  const ID_STATION_BIKES_AVAIL = 'station-bikes-available';
  const ID_STATION_X_OVERLAY = 'station-overlay';
  function getElementId(element, stationId) {
    switch (element) {
      default:
      case undefined:
        throw new Error(`Bad element ${element}`);
      case ID_STATION:
        return `station-${stationId}`;
      case ID_STATION_WRAP:
        return `station-wrap-${stationId}`;
      case ID_STATION_NAME:
        return `station-name-${stationId}`;
      case ID_STATION_BIKES_AVAIL:
        return `station-bikes-available-${stationId}`;
      case ID_STATION_X_OVERLAY:
        return `station-overlay-${stationId}`;
    }
  }

  function createStation(stationId) {
    const newStationHtml =
      `<div class="col-xs-12 col-sm-4 col-md-3 col-lg-2 station" id="${getElementId(ID_STATION, stationId)}">
        <div id="${getElementId(ID_STATION_WRAP, stationId)}">
          <span id="${getElementId(ID_STATION_NAME, stationId)}" class="station-name">Loading station name...</span>
          <br>
          Bikes available:
          <span id="${getElementId(ID_STATION_BIKES_AVAIL, stationId)}" class="station-bikes-available">Loading bike count...</span>
          <br><br>
        </div>
        <div class="x-overlay" id="${getElementId(ID_STATION_X_OVERLAY, stationId)}" />
      </div>`;
    // Add the station
    $('#station-row').append(newStationHtml);
    activeStations.push(stationId)
    // Remove the station on click
    $('.station').click(function () {
      $(this).remove()
      let index = activeStations.indexOf(stationId)
      if (index > -1) { activeStations.splice(index, 1) };
    })
    // Hide the "X" overlay, show it on hover
    $('#' + getElementId(ID_STATION_X_OVERLAY, stationId)).hide();
    $('#' + getElementId(ID_STATION, stationId)).hover(
      function () {
        $('#' + getElementId(ID_STATION_WRAP, stationId)).hide();
        $('#' + getElementId(ID_STATION_X_OVERLAY, stationId)).show();
      },
      function () {
        $('#' + getElementId(ID_STATION_WRAP, stationId)).show();
        $('#' + getElementId(ID_STATION_X_OVERLAY, stationId)).hide();
      }
    )

    // Get the station name
    gbfsClient.stationInfo(stationId)
    .then(station => {
      $('#' + getElementId(ID_STATION_NAME, stationId)).text(station.name);
    }).catch(err => {
      $('#' + getElementId(ID_STATION_NAME, stationId)).text(`Error! ${err.message}`);
    })

    // Get the station status
    //refreshStationStatus(stationId);
    refreshAllStationStatus();
  }

})
