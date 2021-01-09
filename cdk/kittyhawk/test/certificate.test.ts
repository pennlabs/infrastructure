
import { Construct } from 'constructs';
import { Certificate } from '../src';
import { failingTest} from './utils'



export function buildFailingCertificateChart(scope: Construct) {

  /** If domain is invalid certificate creation should throw an error. **/
  new Certificate(scope, 'serve', {
    ingress: [{host: 'pennlabsorg', paths: ['/']}],
  })
}

test('Certificate -- Failing', () => failingTest(buildFailingCertificateChart));

