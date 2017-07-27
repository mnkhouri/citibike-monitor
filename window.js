const GbfsClient = require('gbfs-client');
const gbfsClient = new GbfsClient();

// Run this function after the page has loaded
$(function () {
  $('#station-name').text('Loading...');

  const stationId = '3191';

  gbfsClient.stationInfo(stationId)
    .then(station => {
    $('#station-name').text(station.name);
  }).catch(err => {
    $('#station-name').text(`Error! ${err.message}`);
  })

  gbfsClient.stationStatus(stationId)
    .then(station => {
    $('#station-bikes-available').text(station.num_bikes_available);
  }).catch(err => {
    $('#station-bikes-available').text(`Error! ${err.message}`);
  })

})
