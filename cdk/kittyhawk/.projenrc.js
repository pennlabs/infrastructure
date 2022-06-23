const { TypeScriptProject } = require('projen/lib/typescript');
const common = require('../projen-common');

const project = new TypeScriptProject({
  name: '@pennlabs/kittyhawk',
  description: 'Tool to generate Kubernetes YAML files using Typescript. Built for Penn Labs.',
  deps: ['cdk8s', 'constructs', 'cron-time-generator', 'cdk8s-cli'],
  devDeps: ['codecov'],
  keywords: ['cdk', 'yaml', 'kubernetes', 'constructs', 'cdk8s'],
  homepage: 'https://kittyhawk.pennlabs.org',
  repositoryDirectory: 'cdk/kittyhawk',
  ...common.options,
  scripts: {
    import: 'yarn run cdk8s import --output src/imports',
  },
});

project.addFields({['version']: '1.1.5'});
project.prettier?.ignoreFile?.addPatterns('src/imports');
project.testTask.steps.forEach(step => {
  if (step.exec) {
    step.exec = step.exec.replace(' --updateSnapshot', '');
  }
});
project.setScript('test', "export GIT_SHA='TESTSHA' AWS_ACCOUNT_ID='TEST_AWS_ACCOUNT_ID' && npx projen test");
project.synth();
