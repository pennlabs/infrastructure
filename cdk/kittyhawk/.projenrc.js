const { TypeScriptProject } = require('projen');
const common = require('../projen-common');

const project = new TypeScriptProject({
  name: '@pennlabs/kittyhawk',
  description: 'Tool to generate Kubernetes YAML files using Typescript. Built for Penn Labs.',
  deps: ['cdk8s@^1.0.0-beta.10', 'constructs'],
  devDeps: ['codecov', 'cron-time-generator', 'cdk8s-cli@1.0.0-beta.50'],
  keywords: ['cdk', 'yaml', 'kubernetes', 'constructs', 'cdk8s'],
  homepage: 'https://kittyhawk.pennlabs.org',
  repositoryDirectory: 'cdk/kittyhawk',
  ...common.options,
  tsconfig: {
    compilerOptions: {
      esModuleInterop: true,
    },
  },
  jestOptions: {
    typescriptConfig: {
      compilerOptions: {
        esModuleInterop: true,
      },
    },
    jestConfig: {
      coveragePathIgnorePatterns: ['src/imports'],
    },
  },
  eslintOptions: {
    ignorePatterns: ['src/imports/*'],
  },
  scripts: {
    import: 'yarn run cdk8s import --output src/imports',
  },
});

project.synth();