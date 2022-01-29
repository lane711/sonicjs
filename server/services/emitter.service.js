const emitterList = [];

(function (exports) {
  exports.on = function (emitterName, functionToExecute) {
    // console.log('>> on ' + emitterName, functionToExecute);
    emitterList.push({
      emitterName: emitterName,
      functionToExecute: functionToExecute
    })
  }

  exports.once = function (emitterName, options) {
    // console.log('>> once ' + emitterName);
  }

  exports.emit = async function (emitterName, options) {
    // console.log('*** emit >> ' + emitterName);
    // console.log('list', emitterList);

    // TODO: ordering

    // filter by current emiiterName
    const emitters = emitterList.filter((x) => x.emitterName === emitterName)

    // execute the functions
    for (let index = 0; index < emitters.length; index++) {
      const subscriber = emitters[index]
      // console.log('executing...' + subscriber.functionToExecute, "on " + subscriber.emitterName);

      try {
        await subscriber.functionToExecute(options)
      } catch (error) {
        console.log('EMIT ERROR:', error)
      }
    }
  }
})(typeof exports === 'undefined' ? (this.emitterService = {}) : exports)
