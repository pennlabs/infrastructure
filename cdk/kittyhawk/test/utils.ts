import { Testing } from 'cdk8s';
import { Construct } from 'constructs';
import { Chart} from '../src';

/**
 * Helper function to run each chart test 
 * @param build function containing the constructs to be generated
 */
export const chartTest = (build: (scope: Construct) => void) => {
  // Overriding env vars for testing purposes
  process.env.RELEASE_NAME = 'RELEASE_NAME';
  process.env.GIT_SHA = 'TAG_FROM_CI';

  const app = Testing.app();
  const chart = new Chart(app, 'kittyhawk', build);
  const results = Testing.synth(chart)
  expect(results).toMatchSnapshot();
}
  
/** Helper function to run each chart test 
 *  @param build function containing the constructs to be generated
*/
export const failingTest = (build: (scope: Construct) => void) => {
  // Overriding env vars for testing purposes
  process.env.RELEASE_NAME = 'RELEASE_NAME';
  process.env.GIT_SHA = 'TAG_FROM_CI';

  const app = Testing.app();
  expect(() => {new Chart(app, 'kittyhawk', build)}).toThrowError();
}