import { Construct } from 'constructs';
import { Application } from '../src';

export function buildWebsiteChart(scope: Construct) {

  new Application(scope, 'serve', {
    deployment: {
      image: 'pennlabs/website',
      tag: 'latest',
    },
    ingress: {
      rules: [{ host: 'pennlabs.org', paths: ['/'] }],
    },
  });
}

// TODO: either write tests to check labels are added here or delete this file
