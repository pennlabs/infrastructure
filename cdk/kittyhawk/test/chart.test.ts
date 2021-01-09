import { Construct } from 'constructs';
import { Application, synth } from '../src';

export function buildWebsiteChart(scope: Construct) {

  new Application(scope, 'serve', {
    image: 'pennlabs/website',
    ingress: [{ host: 'pennlabs.org', paths: ['/'] }],
  })
}

test('Synth Function', () =>
  expect(function () { synth(buildWebsiteChart) }).not.toThrow());