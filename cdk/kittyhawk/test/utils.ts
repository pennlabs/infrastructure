import { Testing } from 'cdk8s';
import { Construct } from 'constructs';
import { PennLabsChart } from '../src';

/**
 * Helper function to run each chart test
 * @param build function containing the constructs to be generated
 */
export const chartTest = (build: (scope: Construct) => void) => {
  // Overriding env vars for testing purposes
  process.env.RELEASE_NAME = 'RELEASE_NAME';
  process.env.GIT_SHA = 'TAG_FROM_CI';

  const app = Testing.app();
  const chart = new PennLabsChart(app, 'kittyhawk');
  build(chart);
  const results = Testing.synth(chart);
  expect(results).toMatchSnapshot();
};

/** Helper function to run each chart test
 *  @param build function containing the constructs to be generated
*/
export const failingTest = (build: (scope: Construct) => void) => {
  // Overriding env vars for testing purposes
  process.env.RELEASE_NAME = 'RELEASE_NAME';
  process.env.GIT_SHA = 'TAG_FROM_CI';

  const app = Testing.app();
  expect(() => { const chart = new PennLabsChart(app, 'kittyhawk'); build(chart); }).toThrowError();
};
