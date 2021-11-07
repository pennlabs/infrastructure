import { Construct } from 'constructs';
import { Application, synth } from '../src';

export function buildWebsiteChart(scope: Construct) {

  new Application(scope, 'serve', {
    deployment: {
      image: 'pennlabs/website',
    },
    ingress: { 
      rules: [{ host: 'pennlabs.org', paths: ['/'] }]
    },
  });
}

test('Synth Function', () =>
  expect(function () { synth(buildWebsiteChart); }).not.toThrow());