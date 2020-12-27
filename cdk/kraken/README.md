# kraken

A cdk library for [cdkactions](https://github.com/ArmaanT/cdkactions/).

## Documentation

See [Kraken documentation](https://kraken.pennlabs.org/).

## Getting started

When creating a new project follow the [cdkactions getting started guide](https://github.com/ArmaanT/cdkactions/blob/master/docs/getting-started/typescript.md).

After that, in the `.github/cdk/main.ts` file delete the pre-generated Stack and replace it with a Kraken Stack.

For example, a Django and React project could use the `ApplicationStack` stack:

``` javascript
new ApplicationStack(app, {
  djangoProjectName: 'exampleDjangoProject',
  dockerImageBaseName: 'example-product',
});
```

Finally, run `yarn build` within the `.github/cdk` folder and commit your changes.
