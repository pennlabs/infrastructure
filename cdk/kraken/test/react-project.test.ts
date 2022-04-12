import { Workflow } from "cdkactions";
import { ReactProject } from "../src";

test("default", () => {
  const workflow = new Workflow(undefined as any, "workflow", {
    name: "Workflow",
    on: "push",
  });
  new ReactProject(workflow, {
    imageName: "example",
  });
  expect(workflow.toGHAction()).toMatchSnapshot();
});

test("custom id", () => {
  const workflow = new Workflow(undefined as any, "workflow", {
    name: "Workflow",
    on: "push",
  });
  new ReactProject(workflow, {
    imageName: "example",
    id: "custom",
  });
  expect(workflow.toGHAction()).toMatchSnapshot();
});
