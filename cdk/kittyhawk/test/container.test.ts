import { Construct } from 'constructs';
import { Application } from '../src/application';
import { chartTest, failingTest } from './utils'

export function buildProbeChart(scope: Construct) {
  /** Probe tests **/
  new Application(scope, 'serve', {
    image: 'pennlabs/website',
    readinessProbe: { path: '/', delay: 5 }, // Default on?
    livenessProbe: { command: ['test', 'command'], period: 5 },
  });
}

export function buildFailingProbeChart(scope: Construct) {

  /** Probes should fail if neither command or path is defined **/
  new Application(scope, 'serve', {
    image: 'pennlabs/website',
    tag: 'latest',
    readinessProbe: { delay: 5 }, 
    livenessProbe: { period: 5 },
  })
}

test('Readiness/Liveliness Probes', () => chartTest(buildProbeChart));

test('Probes -- Failing', () => failingTest(buildFailingProbeChart));
