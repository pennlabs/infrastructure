import { Chart, ChartProps } from 'cdk8s';
import { Construct } from 'constructs';

export class PennLabsChart extends Chart {
  constructor(scope: Construct, name: string, props?: ChartProps) {
    super(scope, name, {
      namespace: props?.namespace,
      labels: {
        "release": (process.env.RELEASE_NAME || 'undefined_release'),
        "app.kubernetes.io/version": (process.env.GIT_SHA || process.exit(1)),
        ...props?.labels,
      },
    });
  }
}
