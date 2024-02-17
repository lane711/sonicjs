import { Hono } from 'hono';
import {
  deleteKVById,
  getById,
  getContentType,
  getContentTypes,
  getDataByPrefix,
  getDataListByPrefix,
  saveContent,
  saveContentType
} from '../data/kv-data';
import { Bindings } from '../types/bindings';
import {
  deleteD1ByTableAndId,
  insertD1Data,
  updateD1Data
} from '../data/d1-data';
import { v4 as uuidv4 } from 'uuid';
import { deleteRecord } from '../data/data';

const content = new Hono<{ Bindings: Bindings }>();

content.get('/ping', (c) => {
  console.log('testing ping', Date());
  return c.text(Date());
});

content.post('/ping', (c) => {
  const id = uuidv4();
  return c.json(id, 201);
});

content.get('/', async (ctx) => {
  console.log('getting main content');

  const { keysOnly, contentType, includeContentType, limit, offset } =
    ctx.req.query();

  const fetchLimit = (limit ?? 100) as number;

  console.log('params-->', keysOnly, contentType, includeContentType);

  let content = [];
  if (keysOnly !== undefined) {
    console.log('getting keys only');
    const list = await getDataListByPrefix(ctx.env.KVDATA, `site1::content::`);
    content = list.keys.map((c) => c.name);
  } else if (contentType !== undefined) {
    content = await getDataByPrefix(
      ctx.env.KVDATA,
      `site1::content::${contentType}`
    );
  } else {
    content = await getDataByPrefix(
      ctx.env.KVDATA,
      `site1::content::`,
      fetchLimit
    );
  }

  if (includeContentType !== undefined) {
    const contentTypes = await getContentTypes(ctx.env.KVDATA);

    await content.map(async (c) => {
      const contentTypeKey = `site1::content-type::${c.systemId}`;
      const ct = contentTypes.find((c) => c.key === contentTypeKey);
      c.contentType = ct; //
    });
    return ctx.json(content);
  }

  ctx.json(content);
});

content.get('/:contentId', async (ctx) => {
  const id = ctx.req.param('contentId');
  const { includeContentType } = ctx.req.query();

  console.log('params-->', includeContentType);

  const content = await getById(ctx.env.KVDATA, `${id}`);

  const data = content.data;
  const dataWithKey = { key: id, ...data }; //add key to top of object
  delete dataWithKey.submit;

  if (includeContentType !== undefined) {
    dataWithKey.contentType = await getContentType(
      ctx.env.KVDATA,
      content.data.systemId
    );
  }

  return ctx.json(dataWithKey);
});

content.get('/contents/:contype-type', async (ctx) => {
  const contentType = ctx.req.param('contype-type');

  const content = await getDataByPrefix(
    ctx.env.KVDATA,
    `site1::content::${contentType}`
  );
  console.log('content', content);
  return ctx.json(content);
});

content.get('/contents-with-meta/:contype-type', async (ctx) => {
  const contentType = ctx.req.param('contype-type');

  const content = await getDataListByPrefix(
    ctx.env.KVDATA,
    `site1::content::${contentType}`
  );
  console.log('content', content);
  return ctx.json(content);
});

//new
content.post('/', async (ctx) => {
  const content = await ctx.req.json();

  // console.log('post new', content)

  const id = uuidv4();
  const timestamp = new Date().getTime();
  content.data.id = id;

  try {
    const result = await saveContent(
      ctx.env.KVDATA,
      content.data,
      timestamp,
      id
    );
    // console.log('result KV', result);
    // return ctx.json(id, 201);
  } catch (error) {
    console.log('error posting content', error);
    return ctx.text(error, 500);
  } finally {
    //then also save the content to sqlite for filtering, sorting, etc
    try {
      const result = await insertD1Data(
        ctx.env.D1DATA,
        ctx.env.KVDATA,
        content.data.table,
        content.data
      );
      // console.log('insertD1Data --->', result)
      return ctx.json(result.id, 201);
    } catch (error) {
      console.log(
        'error posting content ' + content.data.table,
        error,
        JSON.stringify(content.data, null, 2)
      );
    }
  }
});

//edit
content.put('/', async (ctx) => {
  const content = await ctx.req.json();

  const timestamp = new Date().getTime();
  // const result = await saveContent(
  //   ctx.env.KVDATA,
  //   content,
  //   timestamp,
  //   content.id
  // );

  try {
    const result = await saveContent(
      ctx.env.KVDATA,
      content,
      timestamp,
      content.id
    );
    return ctx.text(content.id, 200);
  } catch (error) {
    console.log('error posting content', error);
    return ctx.text(error, 500);
  } finally {
    //then also save the content to sqlite for filtering, sorting, etc
    try {
      const result = await updateD1Data(ctx.env.D1DATA, content.table, content);
    } catch (error) {
      console.log('error posting content', error);
    }
  }
});

//delete
content.delete('/:contentId', async (ctx) => {
  const id = ctx.req.param('contentId');
  console.log('deleting ' + id);

  const content = await getById(ctx.env.KVDATA, `${id}`);

  console.log('delete content ' + JSON.stringify(content, null, 2));

  if (content) {
    console.log('content found, deleting...');
    const result = await deleteRecord(ctx.env.D1DATA, ctx.env.D1DATA, {
      id,
      table: content.table
    });
    // const kvDelete = await deleteKVById(ctx.env.KVDATA, id);
    // const d1Delete = await deleteD1ByTableAndId(
    //   ctx.env.D1DATA,
    //   content.data.table,
    //   content.data.id
    // );
    console.log('returning 204');
    return ctx.text('', 204);
  } else {
    console.log('content not found');
    return ctx.text('', 404);
  }
});

// content.post("/", async (c) => {
//   const content = await c.req.json();
//   const key = content.key;

//   const result = await saveContent(c.env.KVDATA, "site1", content, key);

//   const status = key ? 204 : 201;

//   return c.text("", status);
// });

export { content };
