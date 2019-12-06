(function(exports){

   exports.test = function(){
        return 'hello world'
    };

    exports.generateShortCode = function(name, args){
        let sc = `[${name.toUpperCase()}`;
        if(args){

            for (var key in args) {
                console.log(' name=' + key + ' value=' + args[key]);
                sc += ` ${key}="${args[key]}"`;
             }
        }
        sc += ']';
        return sc;
    };

})(typeof exports === 'undefined'? this['sharedService']={}: exports);