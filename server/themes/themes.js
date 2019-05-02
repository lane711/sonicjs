var fs = require('fs');

module.exports = {

    getTheme: function () {
        let themePath = __dirname + '/base/index.html';
        
        return new Promise((resolve, reject) => {
            fs.readFile(themePath, "utf8", (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

    },

    test: function () {
        return "ipsume 743";
    }

}