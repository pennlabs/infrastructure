import { App } from "cdkactions";
import { CDKPublishStack } from "@pennlabs/kraken"

const app = new App();
new CDKPublishStack(app, 'kraken');
app.synth();
