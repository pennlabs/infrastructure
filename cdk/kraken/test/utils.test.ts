import { buildId, buildName } from '../src';

test('buildId no suffix', () => {
  const id = 'id';
  const suffix = '';
  expect(buildId(id, suffix)).toBe(id);
});

test('buildId with suffix', () => {
  const id = 'id';
  const suffix = 'abc';
  expect(buildId(id, suffix)).toBe(`${id}-${suffix}`);
});

test('buildName no suffix', () => {
  const name = 'name';
  const id = '';
  expect(buildName(name, id)).toBe(name);
});

test('buildName woth suffix', () => {
  const name = 'name';
  const id = 'id';
  expect(buildName(name, id)).toBe(`${name} ${id}`);
});
