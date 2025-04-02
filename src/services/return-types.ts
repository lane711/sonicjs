export function return200(): Response;
export function return200(data: object): Response;
export function return200(data: object = {}): Response {
  if (Object.keys(data).length === 0) {
    return new Response(
      JSON.stringify({
        data,
      }),
      { status: 200 }
    );
  }
  return new Response(
    JSON.stringify(data),
    { status: 200 }
  );
}

export const return201 = (message = "Record Created") => {
  return new Response(
    JSON.stringify({
      message,
    }),
    { status: 201 }
  );
};

export const return204 = (message = "Record Deleted") => {
  return new Response(
    JSON.stringify({
      message,
    }),
    { status: 201 }
  );
};

export const return400 = (message = "Unauthorized") => {
  return new Response(
    JSON.stringify({
      message,
    }),
    { status: 400 }
  );
};

export const return401 = (message = "Unauthorized") => {
  return new Response(
    JSON.stringify({
      message,
    }),
    { status: 401 }
  );
};

export const return404 = (message = "Not Found") => {
  return new Response(
    JSON.stringify({
      message,
    }),
    { status: 404 }
  );
};

export function return500(): Response;
export function return500(message: string): Response;
export function return500(object: object): Response;
export function return500(messageOrObject: string | object = "Internal Server Error"): Response {
  if (typeof messageOrObject === "string") {
    return new Response(
      JSON.stringify({
        message: messageOrObject,
      }),
      { status: 500 }
    );
  }
  return new Response(
    JSON.stringify(messageOrObject),
    { status: 500 }
  );
}