const EntitySchema = require("typeorm").EntitySchema;
const Content = require("../model/Content").Content;
const Tag = require("../model/Tag").Tag;

module.exports = new EntitySchema({
    name: "Content",
    target: Content,
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        data: {
            type: "text"
        },
        contentTypeId: {
            type: "varchar"
        },
        createdByUserId: {
            type: "int"
        },
        lastUpdatedByUserId: {
            type: "int"
        },
        createdOn: {
            type: "datetime"
        },
        updatedOn: {
            type: "datetime"
        },
        url: {
            type: "varchar",
            unique:true,
        },
        tags: {
            type: "varchar"
        }
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