const { TypeScriptProject } = require('projen');
const common = require('../projen-common');

const project = new TypeScriptProject({
  name: '@pennlabs/kraken',
  description: 'cdkactions construct abstractions built for Penn Labs',
  deps: ['cdkactions', 'constructs', 'dedent-js'],
  devDeps: ['codecov'],
  keywords: ['cdk', 'github', 'actions', 'constructs', 'cdkactions'],
  homepage: 'https://kraken.pennlabs.org',
  repositoryDirectory: 'cdk/kraken',
  ...common.options,
});

project.synth();
