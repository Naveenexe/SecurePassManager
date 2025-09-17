import { memoryStorage } from "./storage";
import { JsonFileStorage } from "./jsonStorage";
import type { IStorage } from "./storage";

const isLocal = () => String(process.env.DEV_LOCAL).toLowerCase() === "true";
const useJson = () => String(process.env.DEV_LOCAL_PERSIST).toLowerCase() === "true";

let resolvedStorage: IStorage;
if (isLocal()) {
  resolvedStorage = useJson() ? new JsonFileStorage() : memoryStorage;
} else {
  const { DatabaseStorage } = await import("./dbStorage.js");
  resolvedStorage = new DatabaseStorage();
}

export const storage: IStorage = resolvedStorage;


