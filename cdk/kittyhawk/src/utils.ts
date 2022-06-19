export type NonEmptyArray<T> = [T, ...T[]];

export function nonEmptyMap<T, U>(
  arr: NonEmptyArray<T>,
  callbackfn: (value: T) => U
): NonEmptyArray<U> {
  return arr.map(callbackfn) as any as NonEmptyArray<U>;
}

export const defaultChildName = "Default";

export const deployToFeatureBranch =
  process.env.DEPLOY_TO_FEATURE_BRANCH == "true";
