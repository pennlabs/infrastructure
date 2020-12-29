# kraken

A cdk library for [cdkactions](https://github.com/ArmaanT/cdkactions/).

## Documentation

See [Kraken documentation](https://kraken.pennlabs.org/).

## Getting started

When creating a new project, do the following:

* Follow the [cdkactions getting started guide](https://github.com/ArmaanT/cdkactions/blob/master/docs/getting-started/typescript.md) to initialize the cdkactions project.
* Run `yarn install @pennlabs/kraken`
* Configure cdkactions (See the following subjections)
* Finally, run `yarn build` within the `.github/cdk` folder and commit your changes.

### Django + React Project

Most Penn Labs products follow the mold of a Django project in the `backend` directory and a React project in the `frontend` directory.

Since this is a common use-case, kraken provides an `ApplicationStack` that can easily configure the CI for this type of project.

To use an `ApplicationStack` stack, just replace the generated stack with:

``` javascript
new ApplicationStack(app, {
  djangoProjectName: 'exampleDjangoProject',
  dockerImageBaseName: 'example-product',
});
```

This configuration will lint, test, build, publish docker images for, and deploy both the Django project and a React project. The published docker images will be named: `$dockerImageBaseName-backend` and `$dockerImageBaseName-frontend`

### Different Configuration

If your repo is different from the normal 1 Django and 1 React project per repo, you can utilize the `DjangoProject` and `ReactProject` classes. For example, if you had a single Django project with multiple frontends, you could add something like the following inside of the generated Stack:

``` javascript
const workflow = new Workflow(this, 'workflow', {
  name: 'Workflow',
  on: 'push',
});

const django = new DjangoProject(workflow,
  {
    projectName: 'djangoProject',
    path: 'backend',
    imageName: 'project-backend',
  });

const reactOne = new ReactProject(workflow,
  {
    id: 'one',
    path: 'frontendOne',
    imageName: 'project-frontendOne',
  });

const reactTwo = new ReactProject(workflow,
  {
    id: 'two',
    path: 'frontendTwo',
    imageName: 'project-frontendTwo',
  });

new DeployJob(workflow, {},
  {
    needs: [django.publishJobId, reactOne.publishJobId, reactTwo.publishJobId],
  });
```

This configuration will lint, test, build, publish docker images for the Django project as well as the two React projects and then finally deploy the application.
