import { Workflow } from 'cdkactions';
import { IntegrationTestsJob } from '../src';


test('default', () => {
  const workflow = new Workflow(undefined as any, 'workflow', {
    name: 'Workflow',
    on: 'push',
  });
  new IntegrationTestsJob(workflow, {
    testCommand: 'exit 0',
    dockerBuildIds: ['id'],
    dockerImages: ['image'],
  });
  expect(workflow.toGHAction()).toMatchSnapshot();
});

test('no post image publish', () => {
  const workflow = new Workflow(undefined as any, 'workflow', {
    name: 'Workflow',
    on: 'push',
  });
  new IntegrationTestsJob(workflow, {
    testCommand: 'exit 0',
    dockerBuildIds: ['id'],
    dockerImages: ['image'],
    createPostIntegrationPublishJob: false,
  });
  expect(workflow.toGHAction()).toMatchSnapshot();
});
