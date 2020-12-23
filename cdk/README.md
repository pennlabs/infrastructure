# cdk

This folder contains the cdk abstractions built for Penn Labs.

We use [projen](https://github.com/projen/projen) to handle most of the configuration of the cdk abstractions.

## Setting up a new CDK project

Create a new directory for the cdk and populate it with the following commands:

```bash
mkdir $name
cd $name
npx projen new typescript
```

Then modify the generated `.projenrc.js` to use the shared `cdk/project-common.js`. See kraken for an example.

Now add the following to the infrastructure repo cdk `new CDKStack(app, '$name');`.

Finally, create a new repo named "$name-docs" and make sure the pennlabsbot account has push access.
