const { TypeScriptProject } = require('projen/lib/typescript');
const common = require('../projen-common');

const project = new TypeScriptProject({
  name: '@pennlabs/kittyhawk',
  description: 'Tool to generate Kubernetes YAML files using Typescript. Built for Penn Labs.',
  deps: ['cdk8s@^1.0.0-beta.10', 'constructs', 'cron-time-generator', 'cdk8s-cli@1.0.0-beta.50'],
  devDeps: ['codecov'],
  keywords: ['cdk', 'yaml', 'kubernetes', 'constructs', 'cdk8s'],
  homepage: 'https://kittyhawk.pennlabs.org',
  repositoryDirectory: 'cdk/kittyhawk',
  ...common.options,
  tsconfig: {
    compilerOptions: {
      esModuleInterop: true,
    },
  },
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
project.testTask.steps.forEach(step => {
  if (step.exec) {
    step.exec = step.exec.replace(' --updateSnapshot', '');
  }
});
project.setScript('test', "export GIT_SHA='TESTSHA' AWS_ACCOUNT_ID='TEST_AWS_ACCOUNT_ID' && npx projen test");
project.synth();
