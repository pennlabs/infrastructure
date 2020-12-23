import { App } from "cdkactions";
import { CDKStack } from "@pennlabs/kraken"

const app = new App();
// TODO: remove modified default branch
new CDKStack(app, 'kraken', { defaultBranch: 'feature/kraken' });
app.synth();
