var emitterList = [];

module.exports = {

    on: function (emitterName, functionToExecute) {
        // console.log('>> on ' + emitterName, functionToExecute);
        emitterList.push({ emitterName: emitterName, functionToExecute: functionToExecute })
    },

    once: function (emitterName, options) {
        // console.log('>> once ' + emitterName);
    },

    emit: async function (emitterName, options) {
        // console.log('*** emit >> ' + emitterName);
        // console.log('list', emitterList);

        //TODO: ordering

        //filter by current emiiterName
        let emitters = emitterList.filter(x => x.emitterName === emitterName);

        //execute the functions
        for (let index = 0; index < emitters.length; index++) {
            let subscriber = emitters[index];
            // console.log('executing...' + subscriber.functionToExecute, "on " + subscriber.emitterName);

            try {
                await subscriber.functionToExecute(options);
            } catch (error) {
                console.log('EMIT ERROR:', error);
            }
        }
    },
    
}


// (function(exports) {
//   exports.test = function() {
//     return "hello world";
//   };

//   exports.generateShortCode = function(name, args) {
//     let sc = `[${name.toUpperCase()}`;
//     if (args) {
//       for (var key in args) {
//         // console.log(' name=' + key + ' value=' + args[key]);
//         sc += ` ${key}="${args[key]}"`;
//       }
//     }
//     sc += "]";
//     return sc;
//   };

//   exports.generateShortCodeList = function(list) {
//     let shortCodeList = "";
//     list.forEach(shortCode => {
//       shortCodeList += this.generateShortCode(shortCode.module, {
//         id: shortCode.id
//       });
//     });
//     return shortCodeList;
//   };

//   exports.generateContentFromShortcodeList = function(shortCodeList) {
//     let shortCodeContent = "";
//     shortCodeList.children.forEach(sc => {
//       shortCodeContent += sc.shortcode.codeText;
//     });
//     return shortCodeContent;
//   };

//   exports.getBaseUrl = function(){
//     var url = window.location.href;
//     var arr = url.split("/");
//     var result = arr[0] + "//" + arr[2]
//     return result;
//   };

// })(typeof exports === "undefined" ? (this["sharedService"] = {}) : exports);
