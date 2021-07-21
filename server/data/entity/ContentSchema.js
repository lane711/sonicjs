const EntitySchema = require("typeorm").EntitySchema;
const Content = require("../model/Content").Content;
const Tag = require("../model/Tag").Tag;
const typeHelper = require('../helper/type.helper');

module.exports = new EntitySchema({
    name: "Content",
    target: Content,
    columns: {
        id: {
            primary: true,
            type: "int",
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
            type: typeHelper.getDateTime()
        },
        updatedOn: {
            type: typeHelper.getDateTime()
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