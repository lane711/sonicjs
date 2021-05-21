/*export */ class Post {
    constructor(id, title, text, categories) {
        this.id = id;
        this.title = title;
        this.text = text;
        this.categories = categories;
    }
}

module.exports = {
    Post: Post
};

