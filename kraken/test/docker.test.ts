import { DockerPublish } from '../lib';

// DockerPublish
test('default', () => {
  const dc = new DockerPublish(undefined as any, 'publish', { imageName: 'example' });
  expect(dc.toGHAction()).toMatchSnapshot();
});

test('disable cache', () => {
  const dc = new DockerPublish(undefined as any, 'publish', { imageName: 'example', cache: false });
  expect(dc.toGHAction()).toMatchSnapshot();
});


test('with overrides', () => {
  const dc = new DockerPublish(undefined as any, 'publish', { imageName: 'example' }, { continueOnError: true });
  expect(dc.toGHAction()).toMatchSnapshot();
});
