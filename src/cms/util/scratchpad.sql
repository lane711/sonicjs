-- run queries again your db:
-- wrangler d1 execute sonicjs  --file=./src/cms/util/scratchpad.sql
-- wrangler d1 execute sonicjs --local --file=./src/cms/util/scratchpad.sql

    SELECT
    posts.id,
    posts.title,
    posts.updatedOn,
    substr(posts.body, 0, 20) as body,
    users.firstName || ' ' || users.lastName as author,
    count(comments.id) as commentCount,
    categories.title as category,
    COUNT() OVER() as total
    FROM posts
    left outer join users
    on posts.userid = users.id
    left outer join comments
    on comments.postId = posts.id
    left outer join categoriesToPosts
    on categoriesToPosts.postId = posts.id
    left outer join categories
    on categoriesToPosts.categoryId = categories.id
    group by posts.id
    order by posts.updatedOn desc
    limit 10
    offset 0;