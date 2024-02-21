// app.d.ts
/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import('../auth/lucia').Auth;
  type DatabaseUserAttributes = {
    firstname?: string;
    lastname?: string;
    email?: string;
    role?: string;
  };
  type DatabaseSessionAttributes = {};
}
