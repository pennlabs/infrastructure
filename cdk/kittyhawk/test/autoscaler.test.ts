
import { Construct } from 'constructs';
import { Application } from '../src/application'
import { failingTest, chartTest } from './utils'

export function buildAutoscalingChart(scope: Construct) {

  /** Autoscaling test **/
  new Application(scope, 'serve', {
    image: 'pennlabs/website',
    autoScalingProps: { cpu: 80, memory: 80, requests: 80 },
  })
}

export function buildFailingAutoscalingChart(scope: Construct) {

  /** Autoscaling cannot be defined with replicas, should fail. **/
  new Application(scope, 'serve', {
    image: 'pennlabs/website',
    tag: 'latest',
    replicas: 2,
    autoScalingProps: { cpu: 80 },
  })
}

test('Autoscaling -- Failing', () => failingTest(buildFailingAutoscalingChart));

test('Autoscaling', () => chartTest(buildAutoscalingChart));
