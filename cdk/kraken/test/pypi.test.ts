import * as fs from 'fs';
import { PyPIPublishStack } from '../src';
import { TestingApp } from './utils';

test('default', () => {
  const app = TestingApp({ createValidateWorkflow: false });
  new PyPIPublishStack(app);
  app.synth();
  expect(fs.readdirSync(app.outdir)).toEqual([
    'cdkactions_build-and-publish.yaml',
  ]);
  expect(fs.readFileSync(`${app.outdir}/cdkactions_build-and-publish.yaml`, 'utf-8')).toMatchSnapshot();
},
);
