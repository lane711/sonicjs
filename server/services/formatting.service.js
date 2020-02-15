var moment = require("moment");

module.exports = formattingService = {
  formatDates: async function(data) {
    data.forEach(element => {
      if (element.data.createdOn) {
        var day = moment(element.data.createdOn);
        element.data.createdOnFormatted = moment(day).format(
          "YYYY-MM-DD, h:mm:ss a"
        );
      } else {
        element.data.createdOnFormatted = "1900-01-01, 12:00:00 am";
      }
    });
  },

  formatTitles: async function(data) {
    let length = 50;
    data.forEach(element => {
      if (!element.data.title) {
        let sourceCopy = "";
        if (element.data.body) {
          sourceCopy = element.data.body;
        } else if (element.data.text) {
          sourceCopy = element.data.text;
        }
        let rawBody = this.stripHtmlTags(sourceCopy);
        if (rawBody) {
          element.data.title = rawBody.substring(0, length);
          if (rawBody.length > length) {
            element.data.title += "...";
          }
        }
      }
    });
  },

  stripHtmlTags: function(str) {
    if (str === null || str === "") return false;
    else str = str.toString();
    return str.replace(/<[^>]*>/g, "");
  }
};
