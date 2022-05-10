const {Entity, ObjectIdColumn, ObjectID, Column} = require("typeorm");

@Entity()
export class User {

    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    age: number;

}


// const EntitySchema = require("typeorm").EntitySchema;
// const User = require("../model/User").User;
// const typeHelper = require('../helper/type.helper');

// module.exports = new EntitySchema({
//     name: "User",
//     target: User,
//     columns: {
//         id: {
//             primary: true,
//             type: "uuid",
//             objectIdColumn: true,
//             generated: false
//         },
//         username: {
//             type: "varchar",
//             unique:true,
//         },
//         salt: {
//             type: "varchar"
//         },
//         hash: {
//             type: "varchar"
//         },
//         profile: {
//             type: "text"
//         },
//         createdOn: {
//             type: typeHelper.getDateTime()
//         },
//         updatedOn: {
//             type: typeHelper.getDateTime()
//         },
//     },
// });