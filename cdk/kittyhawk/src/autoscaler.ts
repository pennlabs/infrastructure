// Mostly borrowed from https://github.com/awslabs/cdk8s/blob/master/examples/typescript/podinfo/lib/autoscaler.ts

import { Construct } from 'constructs';
import { KubeHorizontalPodAutoscalerV2Beta2 as HorizontalPodAutoscalerApiObject } from './imports/k8s';

export interface ScaleTarget {
  readonly apiVersion: string;
  readonly kind: string;
  readonly name: string;
}

export interface AutoscalingProps {
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
      },
    });
  }
}
