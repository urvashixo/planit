import { Redis } from "@upstash/redis";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export function getRedis() {
  return new Redis({
    url: required("UPSTASH_REDIS_REST_URL"),
    token: required("UPSTASH_REDIS_REST_TOKEN")
  });
}

export function cacheKey(scope: "audit" | "summary", pricingVersion: string, auditHash: string): string {
  return `${scope}:${pricingVersion}:${auditHash}`;
}
