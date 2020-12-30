import { ReactCheckJob } from '../src';

test('default', () => {
  const dc = new ReactCheckJob(undefined as any, {});
  expect(dc.toGHAction()).toMatchSnapshot();
});

test('different node version', () => {
  const dc = new ReactCheckJob(undefined as any, { nodeVersion: '12' });
  expect(dc.toGHAction()).toMatchSnapshot();
});

test('different directory', () => {
  const dc = new ReactCheckJob(undefined as any, { path: 'frontend' });
  expect(dc.toGHAction()).toMatchSnapshot();
});

test('with overrides', () => {
  const dc = new ReactCheckJob(undefined as any, {}, { continueOnError: true });
  expect(dc.toGHAction()).toMatchSnapshot();
});
