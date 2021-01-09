const { TypeScriptProject } = require('projen');
const common = require('../projen-common');

const project = new TypeScriptProject({
  name: '@pennlabs/kittyhawk',
  description: 'Tool to generate Kubernetes YAML files using Typescript. Built for Penn Labs.',
  deps: ['cdk8s', 'constructs'],
  devDeps: ['codecov', 'cron-time-generator', 'cdk8s-cli'],
  keywords: ['cdk', 'yaml', 'kubernetes', 'constructs', 'cdk8s'],
  homepage: 'https://kittyhawk.pennlabs.org',
  repositoryDirectory: 'cdk/kittyhawk',
  ...common.options,
});

project.synth();