/**
 * Typedefs - the entity definitions used by the system
 * @module typeDefs
 */

/**
 * A user that can log into the system
 * @typedef {Object} User
 * @property {number} id - Student ID
 * @property {string} name - Student name
 * @property {string|number} [age] - Student age (optional)
 * @property {boolean} isActive - Student is active
 */

/**
 * @type {User}
 */
const student = {
  id: 1,
  name: "John Doe",
  age: 20,
  isActive: true,
};
