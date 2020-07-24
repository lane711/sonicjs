//const axios = require('axios');

$(document).ready(function () {
  console.log("installing");

  $(".btn-check-connection").click(function () {
    let database = $(".nav-link.active").text();
    console.log("database", database);
  });
});
