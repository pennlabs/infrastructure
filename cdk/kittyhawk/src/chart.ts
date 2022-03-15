import { Chart, ChartProps } from 'cdk8s';
import { Construct } from 'constructs';

export class PennLabsChart extends Chart {
  constructor(scope: Construct, name: string, props?: ChartProps) {
    const GIT_SHA = process.env.GIT_SHA;
    if (!GIT_SHA) {
      console.error('No GIT_SHA environment variable provided.');
      process.exit(1);
    }

    super(scope, name, {
      namespace: props?.namespace,
      labels: {
        'app.kubernetes.io/part-of': (process.env.RELEASE_NAME || 'undefined_release'),
        'app.kubernetes.io/version': (GIT_SHA),
        'app.kubernetes.io/managed-by': 'kittyhawk',
        ...props?.labels,
      },
    });
  }
}
