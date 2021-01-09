import { Construct } from 'constructs';
import { App, Chart as ChartApiObject } from 'cdk8s';

export class Chart extends ChartApiObject {
  constructor(scope: Construct, name: string, chartBuilder: (scope: Construct) => void) {
    // grab the release name from env vars
    super(scope, name, {
      labels : {
        release: (process.env.RELEASE_NAME || 'undefined_release')}}); 
    chartBuilder(this);
  }
}

export function synth (chartBuilder: (scope: Construct) => void) {
  const app = new App();
  new Chart(app, 'kittyhawk', chartBuilder);
  app.synth();
}