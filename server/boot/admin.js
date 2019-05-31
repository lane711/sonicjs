var fs = require('fs');

module.exports = {

    loadAdmin: function () {
        let adminPath = __dirname + '/../../admim/dist/client/index.html';
        console.log('adminPath', adminPath);

        return new Promise((resolve, reject) => {
            fs.readFile(adminPath, "utf8", (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

    }, 

    test: function () {
        return "ipsume 743";
    }

}