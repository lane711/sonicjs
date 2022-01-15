const EntitySchema = require("typeorm").EntitySchema;
const User = require("../model/User").User;
const typeHelper = require('../helper/type.helper');

module.exports = new EntitySchema({
    name: "User",
    target: User,
    columns: {
        id: {
            primary: true,
            type: "uuid",
            generated: false
        },
        username: {
            type: "varchar",
            unique:true,
        },
        salt: {
            type: "varchar"
        },
        hash: {
            type: "varchar"
        },
        profile: {
            type: "text"
        },
        createdOn: {
            type: typeHelper.getDateTime()
        },
        updatedOn: {
            type: typeHelper.getDateTime()
        },
    },
});