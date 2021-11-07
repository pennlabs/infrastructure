
import { Construct } from 'constructs';
import { Application } from '../src/application';
import { failingTest, chartTest } from './utils';

export function buildAutoscalingChart(scope: Construct) {

  /** Autoscaling test **/
  new Application(scope, 'serve', {
    deployment: {
      image: 'pennlabs/website',
      autoScalingProps: { cpu: 80, memory: 80, requests: 80 }, // TODO: fix this
    },
  });
}

export function buildFailingAutoscalingChart(scope: Construct) {

  /** Autoscaling cannot be defined with replicas, should fail. **/
  new Application(scope, 'serve', {
    deployment: {
      image: 'pennlabs/website',
      tag: 'latest',
      replicas: 2,
      autoScalingProps: { cpu: 80 }, // TODO: fix this
    },
  });
}

export function buildEmptyAutoscalingChart(scope: Construct) {

  /** Autoscaling test with empty autoScalingProps should throw **/
  new Application(scope, 'serve', {
    deployment: {
      image: 'pennlabs/website',
      autoScalingProps: {},
    },
  });
}

test('Autoscaling -- Failing', () => failingTest(buildFailingAutoscalingChart));
test('Autoscaling Empty -- Failing', () => failingTest(buildEmptyAutoscalingChart));
test('Autoscaling', () => chartTest(buildAutoscalingChart));
