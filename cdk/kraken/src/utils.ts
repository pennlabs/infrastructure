export const buildId = (id: string, suffix: string) =>
  suffix ? `${id}-${suffix}` : id;
export const buildName = (name: string, id: string) => `${name} ${id}`.trim();
