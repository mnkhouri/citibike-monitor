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


  const createStation = function(stationId) {
    const idStation = `station-${stationId}`;
    const idStationWrap = `station-wrap-${stationId}`;
    const idStationName = `station-name-${stationId}`;
    const idStationBikesAvail = `station-bikes-available-${stationId}`;
    const idStationOverlay = `station-overlay-${stationId}`;

    const newStationHtml =
      `<div class="col-xs-12 col-sm-4 col-md-3 col-lg-2 station" id="${idStation}">
        <div id="${idStationWrap}">
          <span id="${idStationName}" class="station-name">Loading station name...</span>
          <br>
          Bikes available:
          <span id="${idStationBikesAvail}" class="station-bikes-available">Loading bike count...</span>
          <br><br>
        </div>
        <div class="x-overlay" id="${idStationOverlay}" />
      </div>`;

    $('#station-row').append(newStationHtml);
    $('#' + idStationOverlay).hide();

    $('.station').click(function () { $(this).hide() })
    $('#' + idStation).hover(
      function () {
        $('#' + idStationWrap).hide();
        $('#' + idStationOverlay).show();
      },
      function () {
        $('#' + idStationWrap).show();
        $('#' + idStationOverlay).hide();
      }
    )

    gbfsClient.stationInfo(stationId)
      .then(station => {
      $('#' + idStationName).text(station.name);
    }).catch(err => {
      $('#' + idStationName).text(`Error! ${err.message}`);
    })

    gbfsClient.stationStatus(stationId)
      .then(station => {
      $('#' + idStationBikesAvail).text(station.num_bikes_available);
    }).catch(err => {
      $('#' + idStationBikesAvail).text(`Error! ${err.message}`);
    })
  }

})
