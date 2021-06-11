/*export */ class Session {
  constructor(expiredAt, id, json) {
    this.expiredAt = expiredAt;
    this.id = id;
    this.json = json;
  }
}


module.exports = {
    Session: Session
};