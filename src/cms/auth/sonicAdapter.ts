import { d1 } from '@lucia-auth/adapter-sqlite';
import { clearKVCache } from '../data/kv-data';
import type { Adapter, InitializeAdapter } from 'lucia';
import { setCacheStatusInvalid } from '../data/cache';

type D1Adapter = ReturnType<typeof d1>;

export const sonicAdapter = (
  d1Adapter: D1Adapter,
  kv: KVNamespace<string>
): InitializeAdapter<Adapter> => {
  return (LuciaError) => {
    const d1 = d1Adapter(LuciaError);
    return {
      ...d1,
      setUser: async (user, key) => {
        await d1.setUser(user, key);
        await setCacheStatusInvalid();
        await clearKVCache(kv);
      },
      deleteUser: async (userId) => {
        await d1.deleteUser(userId);
        await setCacheStatusInvalid();
        await clearKVCache(kv);
      },
      updateUser: async (userId, partialUser) => {
        await d1.updateUser(userId, partialUser);
        await setCacheStatusInvalid();
        await clearKVCache(kv);
      },

      setSession: async (session) => {
        await d1.setSession(session);
        await setCacheStatusInvalid();
        await clearKVCache(kv);
      },
      deleteSession: async (sessionId) => {
        await d1.deleteSession(sessionId);
        await setCacheStatusInvalid();
        await clearKVCache(kv);
      },
      deleteSessionsByUserId: async (userId) => {
        await d1.deleteSessionsByUserId(userId);
        await setCacheStatusInvalid();
        await clearKVCache(kv);
      },
      updateSession: async (sessionId, partialSession) => {
        await d1.updateSession(sessionId, partialSession);
        await setCacheStatusInvalid();
        await clearKVCache(kv);
      },

      setKey: async (key) => {
        await d1.setKey(key);
        await setCacheStatusInvalid();
        await clearKVCache(kv);
      },
      deleteKey: async (keyId) => {
        await d1.deleteKey(keyId);
        await setCacheStatusInvalid();
        await clearKVCache(kv);
      },
      deleteKeysByUserId: async (userId) => {
        await d1.deleteKeysByUserId(userId);
        await setCacheStatusInvalid();
        await clearKVCache(kv);
      },
      updateKey: async (keyId, partialKey) => {
        await d1.updateKey(keyId, partialKey);
        await setCacheStatusInvalid();
        await clearKVCache(kv);
      }
    };
  };
};
