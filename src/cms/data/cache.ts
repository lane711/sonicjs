
import loki from 'lokijs'
var db = new loki('sandbox.db');
var cache = db.addCollection('cache');


export async function addToCache(key:string, data){
  console.log('addToCache', key)
  cache.insert({ key, data});
}

export async function getFromCache(key:string){
  console.log('getFromCache', key)
  let data = await cache.find({ 'key': key });
  return data;
}

