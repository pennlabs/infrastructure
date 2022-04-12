exports.options = {
    repository: 'https://github.com/pennlabs/infrastructure.git',
    authorName: "Penn Labs",
    authorAddress: "contact@pennlabs.org",
    authorOrganization: 'Penn Labs',
    authorUrl: 'https://pennlabs.org',
    buildWorkflow: false,
    pullRequestTemplate: false,
    releaseWorkflow: false,
    stale: false,
    githubOptions: {
        pullRequestLint: false,
    },
    depsUpgrade: false,
    dependabot: false,
    mergify: false,
    compat: false,
    dependabot: false,
    rebuildBot: false,
    clobber: false,
    docgen: true,
    docsDirectory: 'docs',
    license: 'MIT',
    licensed: true,
    gitignore: ['/docs'],
    defaultReleaseBranch: 'master',
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
}
