const EntitySchema = require("typeorm").EntitySchema;
const Session = require("../model/Session").Session; // import {Category} from "../model/Category";

module.exports = new EntitySchema({
    name: "Session",
    target: Session,
    columns: {
        expiredAt: {
            type: "bigint",
        },
        id: {
            primary: true,
            type: "varchar"
        },
        json: {
            type: "text"
        }
    }
});