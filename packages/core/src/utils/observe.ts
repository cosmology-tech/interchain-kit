// export const createObservable = (object: any, onUpdate?: () => void): any => {
//   if (object === null || typeof object !== 'object' || object instanceof Promise) {
//     return object;
//   }
//   return new Proxy(object, {
//     set(target, property, newValue, receiver) {
//       onUpdate && onUpdate();
//       return Reflect.set(target, property, createObservable(newValue, onUpdate), receiver);
//     },
//     get(target, property, receiver) {
//       const value = Reflect.get(target, property, receiver);
//       return createObservable(value, onUpdate);
//     }
//   });
// };

type ChangeDetails = {
  target: any; // 由于我们处理的是动态对象，所以这里使用any
  prop: string | symbol;
  oldValue: any;
  newValue: any;
};

type ChangeCallback = (change: ChangeDetails) => void;

export function createObservable<T extends object>(target: T, updateCallback: ChangeCallback): T {
  // Use a WeakMap to store proxies for each object to prevent recreating proxies for the same object
  const proxiedObjects = new WeakMap<object, any>();

  function createProxy(obj: object): any {
    // If the object is not an object, null, or a Promise, return it as is
    if (typeof obj !== 'object' || obj === null || obj instanceof Promise) return obj;

    // Check if we've already created a proxy for this object
    if (proxiedObjects.has(obj)) return proxiedObjects.get(obj);

    const proxy = new Proxy(obj, {
      get(target: object, prop: string | symbol, receiver: any): any {
        const value = Reflect.get(target, prop, receiver);
        // Create or return existing proxy for nested objects
        return typeof value === 'object' && value !== null ? createProxy(value) : value;
      },
      set(target: object, prop: string | symbol, value: any, receiver: any): boolean {
        const oldValue = Reflect.get(target, prop, receiver);
        if (oldValue !== value) {
          // If the new value is an object, ensure we proxy it before setting
          if (typeof value === 'object' && value !== null) {
            value = createProxy(value);
          }
          // Update the value in the target object
          const result = Reflect.set(target, prop, value, receiver);
          // Call the update callback after the set operation
          updateCallback({ target, prop, oldValue, newValue: value });
          return result;
        }
        return true;
      }
    });

    // Store this proxy in our WeakMap to avoid creating multiple proxies for the same object
    proxiedObjects.set(obj, proxy);
    return proxy;
  }

  // Start by creating a proxy for the target object
  return createProxy(target) as T;
}