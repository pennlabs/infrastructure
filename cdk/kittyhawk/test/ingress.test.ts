import { Construct } from 'constructs';
import { Application } from '../src/application';
import { failingTest } from './utils'

export function buildFailingIngressChart(scope: Construct) {

  /** Incorrect ingress host string should fail**/
  new Application(scope, 'serve', {
    image: 'pennlabs/website',
    tag: 'latest',
    ingress: [{ host: 'pennlabsorg', paths: ['/'] }],
  })
}

test('Ingress Regex -- Failing', () => failingTest(buildFailingIngressChart));
