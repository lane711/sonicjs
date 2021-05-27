/*export */ 
class User {
    constructor(id, username, password, profile, createdOn, updatedOn) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.profile = profile;
        this.createdOn = createdOn;
        this.updatedOn = updatedOn;
    }
}

module.exports = {
    User: User
};