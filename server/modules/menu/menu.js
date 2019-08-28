var hookService = require('./hook.service');
const hookCollection = hookService.getHookCollection();
//https://stackoverflow.com/questions/10869276/how-to-deal-with-cyclic-dependencies-in-node-js
// var express = require('express');
// var app = module.exports = express();
// load in other dependencies, which can now require this file and use app

module.exports = {

    registerHooks: async function () {

        hookCollection.before('load', function addMenu (record) {
            record.menu = "menu load here";
          });

        hookCollection.before('save', function addMenu (record) {
            record.menu = "menu goes here";
          });
    },

    getMenu: async function (menuName) {

    }

    

}

// this.registerHooks('host');
console.log('----> menu service init 1')