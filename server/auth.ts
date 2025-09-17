import type { Express, RequestHandler } from "express";

const isLocal = () => String(process.env.DEV_LOCAL).toLowerCase() === "true";

let setupAuthImpl: (app: Express) => Promise<void>;
let isAuthenticatedImpl: RequestHandler;

if (isLocal()) {
  // Local, no-auth mode
  setupAuthImpl = async (_app: Express) => {
    // no-op for local
  };

  isAuthenticatedImpl = (req, _res, next) => {
    // minimal user stub compatible with existing code
    (req as any).user = {
      claims: { sub: "local-user" },
      expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    };
    next();
  };
} else {
  // Defer import to avoid evaluating replitAuth in local mode
  const replit = await import("./replitAuth.js");
  setupAuthImpl = replit.setupAuth;
  isAuthenticatedImpl = replit.isAuthenticated;
}

export const setupAuth = setupAuthImpl;
export const isAuthenticated = isAuthenticatedImpl;


