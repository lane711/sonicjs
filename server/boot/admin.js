var fs = require('fs');
var path = require("path");
const chalk = require('chalk');

module.exports = {

    // loadAdmin: function () {
    //     let adminPath = path.join(__dirname, '../..', '/admin/dist/client/index.html');
    //     // console.log('adminPath--->', adminPath);

    //     return new Promise((resolve, reject) => {
    //         fs.readFile(adminPath, "utf8", (err, data) => {
    //             if (err){
    //                 console.log(chalk.red(err));
    //                reject(err); 
    //             } 
    //             else resolve(data);
    //         });
    //     });

    // }, 

    // test: function () {
    //     return "ipsume 743";
    // }

}