/*export */ 
class Content {
    constructor(id, data, contentTypeId, createdByUserId, lastUpdatedByUserId, createdOn, updatedOn, url, tags) {
        this.id = id;
        this.data = data;
        this.contentTypeId = contentTypeId;
        this.createdByUserId = createdByUserId;
        this.lastUpdatedByUserId = lastUpdatedByUserId;
        this.createdOn = createdOn;
        this.updatedOn = updatedOn;
        this.url = url;
        this.tags = tags;
    }
}

module.exports = {
    Content: Content
};