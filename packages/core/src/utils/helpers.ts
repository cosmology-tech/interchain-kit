export function isInstanceOf<T>(obj: any, type: new (...args: any[]) => T): obj is T {
  if (!obj || typeof obj !== "object") return false;

  // Check for custom metadata
  if (obj.__class === type.name) return true;

  // Fallback to prototype chain check
  let proto = Object.getPrototypeOf(obj);
  while (proto) {
    if (proto.constructor === type) return true;
    proto = Object.getPrototypeOf(proto);
  }

  return false;
}

export function createArray<T>(...items: T[]): T[] {
  return items;
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function waitForCondition(
  condition: () => boolean,
  interval: number = 100,
  timeout: number = 5000
): Promise<void> {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const checkCondition = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - start >= timeout) {
        reject(new Error("Timeout waiting for condition"));
      } else {
        setTimeout(checkCondition, interval);
      }
    };

    checkCondition();
  });
}