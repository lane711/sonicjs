const EntitySchema = require("typeorm").EntitySchema;
const Session = require("../model/Session").Session; // import {Category} from "../model/Category";

module.exports = new EntitySchema({
    name: "Session",
    target: Session,
    columns: {
        expiredAt: {
            primary: true,
            type: "bigint",
        },
        id: {
            type: "varchar"
        },
        json: {
            type: "text"
        }
    }
});