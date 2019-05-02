var fs = require('fs');
const cheerio = require('cheerio')

module.exports = {

    getTheme: function () {
        let themePath = __dirname + '/base/index.html';

        return new Promise((resolve, reject) => {
            fs.readFile(themePath, "utf8", (err, data) => {
                if (err) reject(err);
                else {
                    let html = this.processTemplate(data);
                    resolve(html);
                } 
            });
        });

    },

    processTemplate: function (html) {
        const $ = cheerio.load(html);
        $('.blog-header-logo').text('Cheerio');
        // const $ = cheerio.load('<h2 class="title">Hello world</h2>')
 
        // $('h2.title').text('Hello there!')
        // console.log($.html());


        return $.html();
    }

}