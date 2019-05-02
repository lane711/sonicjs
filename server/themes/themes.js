var fs = require('fs');

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
        return html.replace('World', 'Home');
    }

}