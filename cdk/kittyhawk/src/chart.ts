import { App, Chart as ChartApiObject } from 'cdk8s';
import { Construct } from 'constructs';

export class PennLabsChart extends ChartApiObject {
  constructor(scope: Construct, name: string, chartBuilder: (scope: Construct) => void) {
    // grab the release name from env vars
    super(scope, name, { labels: { 
      release: (process.env.RELEASE_NAME || 'undefined_release'),
      "app.kubernetes.io/version": (process.env.GIT_SHA || process.exit(1)),
    } });
    chartBuilder(this);
  }
}

export function synth(chartBuilder: (scope: Construct) => void) {
  const app = new App();
  new PennLabsChart(app, 'kittyhawk', chartBuilder);
  app.synth();
}
