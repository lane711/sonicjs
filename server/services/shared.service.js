(function(exports){

   exports.test = function(){
        return 'hello world'
    };

    exports.generateShortCode = function(name, args){
        let sc = `[${name.toUpperCase()}`;
        if(args){

            for (var key in args) {
                // console.log(' name=' + key + ' value=' + args[key]);
                sc += ` ${key}="${args[key]}"`;
             }
        }
        sc += ']';
        return sc;
    };

    exports.generateShortCodeList = function(list){
      let shortCodeList = "";
      list.forEach(shortCode => {
        shortCodeList += this.generateShortCode(shortCode.module, {id: shortCode.id});
      });
      return shortCodeList;
  };

})(typeof exports === 'undefined'? this['sharedService']={}: exports);
