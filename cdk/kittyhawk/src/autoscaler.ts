// Mostly borrowed from https://github.com/awslabs/cdk8s/blob/master/examples/typescript/podinfo/lib/autoscaler.ts

import { Construct } from 'constructs';
import { KubeHorizontalPodAutoscalerV2Beta2 as HorizontalPodAutoscalerApiObject, MetricSpec, Quantity } from '../imports/k8s';

export interface ScaleTarget {
  readonly apiVersion: string;
  readonly kind: string;
  readonly name: string;
}

export interface AutoscalingProps {

  /**
     * target CPU usage per pod
     */
  readonly cpu?: number;

  /**
     * target memory usage per pod
     */
  readonly memory?: number;

  /**
     * target requests per second per pod
     */
  readonly requests?: number;

  /**
     * @default 10
     */
  readonly maxReplicas?: number;

  /**
     * @default 2
     */
  readonly minReplicas?: number;
}

export interface AutoscalerProps extends AutoscalingProps {
  /**
     * The scaling target.
     */
  readonly target: ScaleTarget;
}

export class Autoscaler extends Construct {
  constructor(scope: Construct, appname: string, props: AutoscalerProps) {
    super(scope, `autoscaler-${appname}`);

    const metrics = new Array<MetricSpec>();

    if (props.cpu) {
      metrics.push({
        type: 'Resource',
        resource: {
          name: 'cpu',
          target: {
            type: 'Utilization',
            averageUtilization: props.cpu,
          },
        },
      });
    }

    if (props.memory) {
      metrics.push({
        type: 'Resource',
        resource: {
          name: 'memory',
          target: {
            type: 'AverageValue',
            averageValue: Quantity.fromNumber(props.memory),
          },
        },
      });
    }

    if (props.requests) {
      metrics.push({
        type: 'Pod',
        pods: {
          metric: {
            name: 'http_requests',
          },
          target: {
            type: 'AverageValue',
            averageValue: Quantity.fromNumber(props.requests),
          },
        },
      });
    }

    new HorizontalPodAutoscalerApiObject(this, 'default', {
      metadata: {
        name: appname,
      },
      spec: {
        scaleTargetRef: {
          apiVersion: props.target.apiVersion,
          kind: props.target.kind,
          name: props.target.name,
        },
        minReplicas: props.minReplicas || 2,
        maxReplicas: props.maxReplicas || 10,
        metrics,
      },
    });
  }
}