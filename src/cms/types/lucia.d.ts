/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import("src/cms/lucia.ts").Auth;
  type DatabaseUserAttributes = {
    firstname?: string;
    lastname?: string;
    email?: string;
    role?: string;
  };
  type DatabaseSessionAttributes = {};
}
