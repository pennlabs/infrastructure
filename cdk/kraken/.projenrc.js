const { TypeScriptProject } = require('projen/lib/typescript');
const common = require('../projen-common');

const project = new TypeScriptProject({
  name: '@pennlabs/kraken',
  description: 'cdkactions construct abstractions built for Penn Labs',
  deps: ['cdkactions', 'constructs', 'ts-dedent'],
  devDeps: ['codecov'],
  keywords: ['cdk', 'github', 'actions', 'constructs', 'cdkactions'],
  homepage: 'https://kraken.pennlabs.org',
  repositoryDirectory: 'cdk/kraken',
  ...common.options,
});

project.addFields({['version']: '0.8.10'});
project.prettier?.ignoreFile?.addPatterns('src/imports');
project.testTask.steps.forEach(step => {
  if (step.exec) {
    step.exec = step.exec.replace(' --updateSnapshot', '');
  }
});
project.synth();
