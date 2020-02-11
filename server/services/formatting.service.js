var dataService = require("./data.service");
var helperService = require("./helper.service");
var fileService = require("./file.service");
var moduleService = require("./module.service");
var globalService = require("./global.service");
var moment = require("moment");

var eventBusService = require("./event-bus.service");

module.exports = formattingService = {
  formatDates: async function(data) {
    data.forEach(element => {
      if(element.data.createdOn){
      var day = moment(element.data.createdOn);
      element.data.createdOnFormatted = moment(day).format('YYYY-MM-DD, h:mm:ss a');
      }
      else{
        element.data.createdOnFormatted('1900-01-01, 12:00:00 am')
      }
    });
  }
};
