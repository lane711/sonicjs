const EntitySchema = require("typeorm").EntitySchema;
const User = require("../model/User").User;

module.exports = new EntitySchema({
    name: "User",
    target: User,
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        username: {
            type: "varchar",
            unique:true,
        },
        password: {
            type: "varchar"
        },
        profile: {
            type: "text"
        },
        createdOn: {
            type: "datetime"
        },
        updatedOn: {
            type: "datetime"
        },
    },
    relations: {
        categories: {
            target: "Tag",
            type: "many-to-many",
            joinTable: true,
            cascade: true
        }
    }
});