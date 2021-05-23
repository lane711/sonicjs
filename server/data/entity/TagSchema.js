const EntitySchema = require("typeorm").EntitySchema; // import {EntitySchema} from "typeorm";
const Tag = require("../model/Tag").Tag; // import {Category} from "../model/Category";

module.exports = new EntitySchema({
    name: "Tag",
    target: Tag,
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        name: {
            type: "varchar"
        }
    }
});