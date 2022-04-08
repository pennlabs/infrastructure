import { Workflow } from "cdkactions";
import { DjangoProject } from "../src";

test("default", () => {
  const workflow = new Workflow(undefined as any, "workflow", {
    name: "Workflow",
    on: "push",
  });
  new DjangoProject(workflow, {
    projectName: "example",
    imageName: "example",
  });
  expect(workflow.toGHAction()).toMatchSnapshot();
});

test("custom id", () => {
  const workflow = new Workflow(undefined as any, "workflow", {
    name: "Workflow",
    on: "push",
  });
  new DjangoProject(workflow, {
    projectName: "example",
    imageName: "example",
    id: "custom",
  });
  expect(workflow.toGHAction()).toMatchSnapshot();
});
