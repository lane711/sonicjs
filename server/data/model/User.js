/*export */ 
class User {
    constructor(id, username, salt, hash, profile, createdOn, updatedOn) {
        this.id = id;
        this.username = username;
        this.salt = salt;
        this.hash = hash;
        this.profile = profile;
        this.createdOn = createdOn;
        this.updatedOn = updatedOn;
    }
}

module.exports = {
    User: User
};