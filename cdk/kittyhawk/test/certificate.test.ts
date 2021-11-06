
import { Construct } from 'constructs';
import { Certificate } from '../src';
import { failingTest } from './utils';


export function buildFailingCertificateChart(scope: Construct) {

  /** If domain is invalid certificate creation should throw an error. **/
  new Certificate(scope, 'serve', {
    ingress: [{ host: 'pennlabsorg', paths: ['/'] }],
  });
}

export function buildUndefinedCertificateChartFails(scope: Construct) {
  /** Creating a certificate without defining ingress prop should fail  */
  new Certificate(scope, 'test', {
    port: 80,
  });
}

test('Certificate -- Failing', () => failingTest(buildFailingCertificateChart));
test('Certificate w Undefined Ingress -- Failing', () => failingTest(buildUndefinedCertificateChartFails));

