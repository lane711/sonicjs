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
        <script src="https://unpkg.com/aos@next/dist/aos.js"></script>
        <script>
        debugger;
            AOS.init();
        </script>`;

        options.page.data.cssLinks += `
            <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />
        `;
    },
}
