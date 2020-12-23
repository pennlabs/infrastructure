import * as fs from 'fs';
import { DjangoStack, ApplicationStack } from '../lib';
import { TestingApp } from './utils';


// DjangoStack
test('default', () => {
  const app = TestingApp({ createValidateWorkflow: false });
  new DjangoStack(app, {
    djangoProjectName: 'example',
    dockerImageName: 'example',
  });
  app.synth();
  expect(fs.readdirSync(app.outdir)).toEqual([
    'cdkactions_build-and-deploy.yaml',
  ]);
  expect(fs.readFileSync(`${app.outdir}/cdkactions_build-and-deploy.yaml`, 'utf-8')).toMatchSnapshot();
},
);

// ApplicationStack
test('default', () => {
  const app = TestingApp({ createValidateWorkflow: false });
  new ApplicationStack(app, {
    djangoProjectName: 'example',
    dockerImageBaseName: 'example',
  });
  app.synth();
  expect(fs.readdirSync(app.outdir)).toEqual([
    'cdkactions_build-and-deploy.yaml',
  ]);
  expect(fs.readFileSync(`${app.outdir}/cdkactions_build-and-deploy.yaml`, 'utf-8')).toMatchSnapshot();
},
);
