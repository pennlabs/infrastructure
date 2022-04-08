import { Workflow } from "cdkactions";
import { DeployJob, DjangoProject, ReactProject } from "../src";

test("workflow with 2 django+react projects", () => {
  const workflow = new Workflow(undefined as any, "workflow", {
    name: "Workflow",
    on: "push",
  });

  const djangoOne = new DjangoProject(workflow, {
    id: "one",
    projectName: "projectOne",
    path: "backendOne",
    imageName: "imageOne-backend",
  });
  const djangoTwo = new DjangoProject(workflow, {
    id: "two",
    projectName: "projectTwo",
    path: "backendTwo",
    imageName: "imageTwo-backend",
  });

  const reactOne = new ReactProject(workflow, {
    id: "one",
    path: "frontendOne",
    imageName: "imageOne-frontend",
  });
  const reactTwo = new ReactProject(workflow, {
    id: "two",
    path: "frontendTwo",
    imageName: "imageTwo-frontend",
  });
  new DeployJob(
    workflow,
    {},
    {
      needs: [
        djangoOne.publishJobId,
        djangoTwo.publishJobId,
        reactOne.publishJobId,
        reactTwo.publishJobId,
      ],
    }
  );

  expect(workflow.toGHAction()).toMatchSnapshot();
});
