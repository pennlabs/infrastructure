import * as fs from "fs";
import { CDKPublishStack } from "../src";
import { TestingApp } from "./utils";

test("default", () => {
  const app = TestingApp({ createValidateWorkflow: false });
  new CDKPublishStack(app, "example");
  app.synth();
  expect(fs.readdirSync(app.outdir)).toEqual(["cdkactions_example.yaml"]);
  expect(
    fs.readFileSync(`${app.outdir}/cdkactions_example.yaml`, "utf-8")
  ).toMatchSnapshot();
});
