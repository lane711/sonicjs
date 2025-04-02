import {
  return200,
  return201,
  return204,
  return500,
} from "@services/return-types";
import type { APIRoute } from "astro";

export async function GET(context) {
  return return200({ hello: "cruel world" });
}

export const POST: APIRoute = async ({ request }) => {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return return500("Invalid JSON body");
  }
  return return201("Valid JSON body");
};

export const DELETE: APIRoute = ({ request }) => {
  return return204();
};

export const ALL: APIRoute = ({ request }) => {
  return return200({ message: "wildcard" });
};
