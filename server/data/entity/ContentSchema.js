const EntitySchema = require("typeorm").EntitySchema;
const Content = require("../model/Content").Content;
const typeHelper = require('../helper/type.helper');

module.exports = new EntitySchema({
    name: "Content",
    target: Content,
    columns: {
        id: {
            primary: true,
            type: "uuid",
            generated: false
        },
        data: {
            type: "text"
        },
        contentTypeId: {
            type: "varchar"
        },
        createdByUserId: {
            type: "uuid"
        },
        lastUpdatedByUserId: {
            type: "uuid"
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
        }
    },
});