export type NonEmptyArray<T> = [T, ...T[]];

export function nonEmptyMap<T, U>(
  arr: NonEmptyArray<T>,
  callbackfn: (value: T) => U
): NonEmptyArray<U> {
  return arr.map(callbackfn) as any as NonEmptyArray<U>;
}
