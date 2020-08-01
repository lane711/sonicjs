var dataService = require("../../../services/data.service");
var eventBusService = require("../../../services/event-bus.service");
var globalService = require("../../../services/global.service");

module.exports = smartlookMainService = {
  startup: async function () {
    eventBusService.on("getRenderedPagePostDataFetch", async function (
      options
    ) {
      if (options && options.page) {
        await smartlookMainService.addHeaderJs(options);
      }
    });
  },

  addHeaderJs: async function (options) {
    let smartlookSettings = await dataService.getContentTopOne("smartlook");
    if (smartlookSettings) {
      options.page.data.headerJs += `<script type='text/javascript'>
          window.smartlook||(function(d) {
            var o=smartlook=function(){ o.api.push(arguments)},h=d.getElementsByTagName('head')[0];
            var c=d.createElement('script');o.api=new Array();c.async=true;c.type='text/javascript';
            c.charset='utf-8';c.src='https://rec.smartlook.com/recorder.js';h.appendChild(c);
            })(document);
            smartlook('init', '${smartlookSettings.data.clientId}');
        </script>`;
    }
  },
};
