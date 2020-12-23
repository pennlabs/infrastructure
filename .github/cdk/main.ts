import { App } from "cdkactions";
import { CDKStack } from "@pennlabs/kraken"

const app = new App();
new CDKStack(app, 'kraken');
app.synth();
