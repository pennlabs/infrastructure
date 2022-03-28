const { ReleaseTrigger } = require('projen/lib/release');
const { TypeScriptProject } = require('projen/lib/typescript');
const common = require('../projen-common');

const project = new TypeScriptProject({
  name: '@pennlabs/kittyhawk',
  description: 'Tool to generate Kubernetes YAML files using Typescript. Built for Penn Labs.',
  deps: ['cdk8s@^1.0.0-beta.10', 'constructs', 'cron-time-generator'],
  devDeps: ['codecov', 'cdk8s-cli@1.0.0-beta.50'],
  keywords: ['cdk', 'yaml', 'kubernetes', 'constructs', 'cdk8s'],
  homepage: 'https://kittyhawk.pennlabs.org',
  repositoryDirectory: 'cdk/kittyhawk',
  ...common.options,
  tsconfig: {
    compilerOptions: {
      esModuleInterop: true,
    },
  },
  release: true,
  releaseTrigger: ReleaseTrigger.manual({}),
  typescriptConfig: {
    tsconfigDev: {
      compilerOptions: {
        esModuleInterop: true,
      },
    },
    jestConfig: {
      coveragePathIgnorePatterns: ['src/imports'],
    },
  },
  prettier: true,
  prettierOptions: {
    ignoreFile: true,
  },
  jestOptions: {
    ignorePatterns: ['src/imports'],
  },
  eslintOptions: {
    ignorePatterns: ['src/imports/*'],
    prettier: true,
  },
  scripts: {
    import: 'yarn run cdk8s import --output src/imports',
  },
});


project.prettier?.ignoreFile?.addPatterns("src/imports");
project.setScript('test', "export GIT_SHA='TESTSHA' AWS_ACCOUNT_ID='TEST_AWS_ACCOUNT_ID' && npx projen test");
project.synth();
