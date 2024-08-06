export const DEFAULT = Symbol();

export class MapWithDefault<K, V> extends Map<K | typeof DEFAULT, V> {
  get(key: K): V {
    return super.get(key) ?? (super.get(DEFAULT) as V);
  }
}
export function sanitize(
  obj: any,
  exceptsNotation: string[],
  deleteOperation = false
) {
  const result: any = {};
  Object.keys(obj).forEach((key) => {
    if (deleteOperation) {
      if (exceptsNotation.includes(key)) {
        delete obj[key];
      }
    } else {
      if (!exceptsNotation.includes(key)) {
        result[key] = obj[key];
      }
    }
  });
  return result;
}
