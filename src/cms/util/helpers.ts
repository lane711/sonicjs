import { validate as isValidUUID } from "uuid";

export function sleep(miliseconds) {
  var currentTime = new Date().getTime();

  while (currentTime + miliseconds >= new Date().getTime()) {}
}

export function extraTableFromUrl(url) {
  const parts = url.split("/");
  const last = parts[parts.length - 1];
  const table =
    last.indexOf("?") > -1 ? last.substr(0, last.indexOf("?")) : last;
  if (isValidUUID(table) || last.length == 1) {
    return parts[parts.length - 2];
  }
  return table;
}
