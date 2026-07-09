import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function createPool(connectionString: string) {
  const pool = new Pool({
    connectionString,
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  pool.on("error", (error) => {
    console.error("[pg] unexpected pool error", error);
  });

  return pool;
}

function getPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (!globalForPrisma.pgPool) {
    globalForPrisma.pgPool = createPool(connectionString);
  }

  return globalForPrisma.pgPool;
}

async function resetPool() {
  const existing = globalForPrisma.pgPool;
  globalForPrisma.pgPool = undefined;
  globalForPrisma.prisma = undefined;

  if (existing) {
    try {
      await existing.end();
    } catch {
      // ignore shutdown races while recovering from a closed connection
    }
  }
}

function createPrismaClient() {
  return new PrismaClient({
    adapter: new PrismaPg(getPool()),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

function isRetryableConnectionError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P1017") {
    return true;
  }

  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return (
    message.includes("server has closed the connection") ||
    message.includes("connectionclosed") ||
    message.includes("connection terminated") ||
    message.includes("econnreset") ||
    message.includes("cannot use a pool after calling end")
  );
}

async function withConnectionRetry<T>(operation: (client: PrismaClient) => Promise<T>) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await operation(getClient());
    } catch (error) {
      lastError = error;
      if (!isRetryableConnectionError(error) || attempt === 3) {
        throw error;
      }

      await resetPool();
      await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
    }
  }

  throw lastError;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    if (property === "$disconnect") {
      return async () => {
        await resetPool();
      };
    }

    if (property === "$connect") {
      return async () => {
        getClient();
      };
    }

    const client = getClient();
    const value = Reflect.get(client, property, client);

    if (typeof value === "function") {
      return value.bind(client);
    }

    if (value && typeof value === "object") {
      return new Proxy(value as object, {
        get(modelTarget, modelProperty, modelReceiver) {
          const modelValue = Reflect.get(modelTarget, modelProperty, modelReceiver);
          if (typeof modelValue !== "function") return modelValue;

          return (...args: unknown[]) =>
            withConnectionRetry((retryClient) => {
              const retryModel = Reflect.get(retryClient, property) as object;
              const retryMethod = Reflect.get(retryModel, modelProperty) as (
                ...inner: unknown[]
              ) => Promise<unknown>;
              return retryMethod.apply(retryModel, args);
            });
        },
      });
    }

    return value;
  },
});
