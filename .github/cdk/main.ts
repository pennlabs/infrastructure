import { App } from "cdkactions";
import { CDKPublishStack } from "@pennlabs/kraken"

const app = new App();
// TODO: remove modified default branch
new CDKPublishStack(app, 'kraken', { defaultBranch: 'feature/kraken' });
app.synth();
