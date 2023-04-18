var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = animateOnScrollMainService = {

    startup: async function () {
        emitterService.on("getRenderedPagePostDataFetch", async function (
          options
        ) {
          if (options && options.page) {
            await animateOnScrollMainService.addJsAndCss(options);
          }
        });
    },

    addJsAndCss: async function (options) {
        options.page.data.jsLinks += `
        <script>
            AOS.init();
        </script>`;
    },
}
