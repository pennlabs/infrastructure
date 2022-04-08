import * as fs from "fs";
import { AutoApproveStack } from "../src";
import { TestingApp } from "./utils";

test("default", () => {
  const app = TestingApp({ createValidateWorkflow: false });
  new AutoApproveStack(app);
  app.synth();
  expect(fs.readdirSync(app.outdir)).toEqual(["cdkactions_autoapprove.yaml"]);
  expect(
    fs.readFileSync(`${app.outdir}/cdkactions_autoapprove.yaml`, "utf-8")
  ).toMatchSnapshot();
});
