import { LuciaError, lucia } from 'lucia';
import {
  generateLuciaPasswordHash,
  generateRandomString,
  validateLuciaPasswordHash
} from 'lucia/utils';
import { d1 } from '@lucia-auth/adapter-sqlite';
import { hono } from 'lucia/middleware';
import { Bindings } from '../types/bindings';
import { Context } from 'hono';
import { prepareD1Data } from '../data/d1-data';
import { v4 as uuidv4 } from 'uuid';
import { sonicAdapter } from './sonicAdapter';
import { Variables } from '../../server';

export type Session = {
  user: any;
};

async function hashPassword(
  password: string,
  kdf: Bindings['AUTH_KDF'] = 'pbkdf2',
  salt: string,
  iterations = 100000,
  hash = 'SHA-512'
) {
  password = password.normalize('NFKC');
  kdf = kdf.toLowerCase() as Bindings['AUTH_KDF'];
  if (kdf !== 'pbkdf2' && kdf !== 'scrypt') {
    kdf = 'pbkdf2';
  }
  hash = hash.toUpperCase();
  if (hash !== 'SHA-512' && hash !== 'SHA-384' && hash !== 'SHA-256') {
    hash = 'SHA-512';
  }
  if (kdf === 'pbkdf2') {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const baseKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    let dkLen = 64;
    switch (hash) {
      case 'SHA-384':
        dkLen = 48;
        break;
      case 'SHA-256':
        dkLen = 32;
        break;
    }
    const hashedPassword = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: encoder.encode(salt),
        iterations,
        hash
      },
      baseKey,
      dkLen * 8
    );

    return {
      kdf,
      hash,
      salt,
      iterations,
      hashedPassword: String.fromCharCode.apply(
        null,
        new Uint8Array(hashedPassword)
      )
    };
  } else {
    return {
      kdf,
      hash,
      salt,
      iterations,
      hashedPassword: await generateLuciaPasswordHash(password)
    };
  }
  // let uint8Array = new Uint8Array(exportedKey);
  // return String.fromCharCode.apply(null, uint8Array);
}
function getIterations(iterationsString?: string) {
  let iterations = 100000;
  if (iterationsString) {
    try {
      iterations = +iterationsString;
    } catch (e) {
      console.error('failed to parse AUTH_ITERATIONS', e);
    }
  }
  return Math.min(iterations, 100000);
}

// compare two strings in a constant time, which is particularly important for security-related operations such as comparing cryptographic hashes. This function safeguards against timing attacks where an attacker can gain information based on the amount of time taken to compare two values.
const constantTimeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  const aUint8Array = new TextEncoder().encode(a);
  const bUint8Array = new TextEncoder().encode(b);

  let c = 0;
  for (let i = 0; i < a.length; i++) {
    c |= aUint8Array[i] ^ bUint8Array[i]; // ^: XOR operator
  }
  return c === 0;
};
export const initializeLucia = (db: D1Database, env: Bindings) => {
  const d1Adapter = d1(db, {
    key: 'user_keys',
    user: 'users',
    session: 'user_sessions'
  });

  const auth = lucia({
    env: env.ENVIRONMENT === 'development' ? 'DEV' : 'PROD', // "PROD" if deployed to HTTPS,
    middleware: hono(),
    adapter: sonicAdapter(d1Adapter, env.KVDATA),
    getUserAttributes: (data) => {
      return data;
    },
    passwordHash: {
      async generate(userPassword) {
        const salt = await generateRandomString(16);

        const hash = await hashPassword(
          userPassword,
          env.AUTH_KDF,
          salt,
          getIterations(env.AUTH_ITERATIONS),
          env.AUTH_HASH
        );
        if (hash.kdf === 'pbkdf2') {
          return `snc:$:${hash.hashedPassword}:$:${salt}:$:${hash.hash}:$:${hash.iterations}`;
        } else {
          return `lca:$:${hash.hashedPassword}`;
        }
      },
      async validate(userPassword, dbHash) {
        const [hasher, hashedPassword, salt, hash, iterations] =
          dbHash.split(':$:');

        let kdf: Bindings['AUTH_KDF'] = 'pbkdf2';
        if (hasher === 'lca') {
          kdf = 'scrypt';
        }
        if (kdf === 'pbkdf2') {
          const verifyHash = await hashPassword(
            userPassword,
            kdf,
            salt,
            getIterations(iterations),
            hash
          );
          return constantTimeEqual(verifyHash.hashedPassword, hashedPassword);
        } else {
          return await validateLuciaPasswordHash(
            userPassword,
            dbHash.substring(4)
          );
        }
      }
    }
  });
  return auth;
};
export type LuciaAPIArgs<T extends string> = {
  ctx: Context<
    {
      Bindings: Bindings;
      Variables: Variables;
    },
    T,
    {}
  >;
  content?: any;
};
export async function createUser<T extends string>(args: LuciaAPIArgs<T>) {
  const { ctx, content } = args;
  if (ctx && content) {
    const d1 = ctx.env.D1DATA;
    const auth = initializeLucia(d1, ctx.env);

    const email = content.data?.email;

    const password = content.data?.password;
    delete content.data?.password;
    const id = uuidv4();
    content.data.id = id;
    const d1Data = prepareD1Data(content.data);
    if (typeof email !== 'string' || !email?.includes('@')) {
      return ctx.text('invalid email', 400);
    } else if (
      typeof password !== 'string' ||
      password.length < 8 ||
      password.length > 255
    ) {
      return ctx.text('invalid password', 400);
    }

    const user = await auth.createUser({
      key: {
        providerId: 'email',
        providerUserId: email.toLowerCase(),
        password // hashed by lucia
      },
      attributes: d1Data
    });
    return ctx.json({ user });
  }
  return new Response('Invalid request', { status: 400 });
}

export async function deleteUser<T extends string>(
  args: LuciaAPIArgs<T>,
  id: string
) {
  const { ctx } = args;
  const d1 = ctx.env.D1DATA;
  const auth = initializeLucia(d1, ctx.env);
  try {
    await auth.deleteUser(id);
    return ctx.text('', 204);
  } catch (e) {
    if (e instanceof LuciaError && e.message === 'AUTH_INVALID_KEY_ID') {
      return ctx.text('', 404);
    }
    return ctx.text('', 500);
  }
}

export async function updateUser<T extends string>(
  args: LuciaAPIArgs<T>,
  id: string
) {
  const { ctx, content } = args;
  const user = ctx.get('user');
  if (ctx && content && id) {
    const d1 = ctx.env.D1DATA;
    const auth = initializeLucia(d1, ctx.env);
    const authRequest = ctx.get('authRequest');

    const email = content.data?.email;
    const password = content.data?.password;
    delete content.data?.password;
    const d1Data = prepareD1Data(content.data, 'users');
    if (email && (typeof email !== 'string' || !email?.includes('@'))) {
      return ctx.text('invalid email', 400);
    } else if (
      password &&
      (typeof password !== 'string' ||
        password.length < 8 ||
        password.length > 255)
    ) {
      return ctx.text('invalid password', 400);
    }

    const updatedUser = await auth.updateUserAttributes(id, {
      ...d1Data
    });

    if (password) {
      let hasKey = false;
      try {
        hasKey = !!(await auth.getKey('email', email.toLowerCase()));
      } catch (e) {
        hasKey = false;
      }
      if (hasKey) {
        await auth.updateKeyPassword('email', email.toLowerCase(), password);
      } else {
        await auth.createKey({
          userId: id,
          providerId: 'email',
          providerUserId: email.toLowerCase(),
          password
        });
      }
    }

    let session = ctx.get('session');
    if (password || d1Data.role) {
      await auth.invalidateAllUserSessions(id);
      if (user?.userId === id) {
        session = await auth.createSession({
          userId: id,
          attributes: {}
        });
      } else {
        session = null;
      }
    }

    if (session) {
      if (authRequest) {
        authRequest.setSession(session);
      }
      ctx.header('Authorization', `Bearer ${session.sessionId}`);
      return ctx.json({ data: updatedUser });
    } else {
      return ctx.text('', 200);
    }
  }
  return new Response('Invalid request', { status: 400 });
}

export async function login<T extends string>(args: LuciaAPIArgs<T>) {
  const { ctx, content } = args;
  const d1 = ctx.env.D1DATA;
  const auth = initializeLucia(d1, ctx.env);
  const email = content?.email;
  const password = content?.password;
  const authRequest = ctx.get('authRequest');
  try {
    // find user by key
    // and validate password
    const key = await auth.useKey('email', email.toLowerCase(), password);
    const session = await auth.createSession({
      userId: key.userId,
      attributes: {}
    });
    if (authRequest) {
      authRequest.setSession(session);
    }
    ctx.header('Authorization', `Bearer ${session.sessionId}`);

    return ctx.json({ bearer: session.sessionId, user: session.user });
  } catch (e) {
    if (
      e instanceof LuciaError &&
      (e.message === 'AUTH_INVALID_KEY_ID' ||
        e.message === 'AUTH_INVALID_PASSWORD')
    ) {
      // user does not exist
      // or invalid password
      return ctx.json({ message: 'Incorrect username or password' }, 400);
    }
    console.log(new Error(e.message, { cause: e }));
    return ctx.json({ message: 'An unknown error occurred' }, 500);
  }
}

export async function logout<T extends string>(ctx: LuciaAPIArgs<T>['ctx']) {
  const d1 = ctx.env.D1DATA;
  const auth = initializeLucia(d1, ctx.env);
  const authRequest = ctx.get('authRequest');
  try {
    const sessionId = ctx.get('session')?.sessionId;
    if (sessionId) {
      await auth.invalidateSession(sessionId);
    }
    if (authRequest) {
      authRequest.setSession(null);
    }
    return ctx.redirect('/admin/login');
  } catch (e) {
    return new Response('An unknown error occurred', {
      status: 500
    });
  }
}

export type Auth = ReturnType<typeof initializeLucia>;
