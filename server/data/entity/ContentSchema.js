const EntitySchema = require("typeorm").EntitySchema;
const ContentORM = require("../model/ContentORM").ContentORM;
const Tag = require("../model/Tag").Tag;

module.exports = new EntitySchema({
    name: "ContentORM",
    target: ContentORM,
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
            type: "int"
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
            type: "varchar"
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