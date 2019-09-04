// const EventEmitter = require('events');
// const emitter = new EventEmitter();
var emitterList = [];

// emitter.on('uncaughtException', function (err) {
//     console.error(err);
// });

module.exports = {

    on: function (emitterName, functionToExecute) {
        console.log('>> on ' + emitterName, functionToExecute);
        emitterList.push({ emitterName: emitterName, functionToExecute: functionToExecute })
    },

    once: function (emitterName, options) {
        console.log('>> once ' + emitterName);
    },

    emit: function (emitterName, options) {
        console.log('*** emit >> ' + emitterName);
        console.log('list', emitterList);

        //TODO: ordering

        //execute the functions
        for (let index = 0; index < emitterList.length; index++) {
            let subscriber = emitterList[index];
            console.log('executing...' + subscriber.functionToExecute, "on " + subscriber.emitterName);

            try {
                subscriber.functionToExecute(options);
            } catch (error) {
                console.log('EMIT ERROR:', error);
            }
        }
    },

}