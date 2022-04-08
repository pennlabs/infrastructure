import { DockerPublishJob } from "../src";

// DockerPublish
test("default", () => {
  const dc = new DockerPublishJob(undefined as any, "publish", {
    imageName: "example",
  });
  expect(dc.toGHAction()).toMatchSnapshot();
});

test("disable cache", () => {
  const dc = new DockerPublishJob(undefined as any, "publish", {
    imageName: "example",
    cache: false,
  });
  expect(dc.toGHAction()).toMatchSnapshot();
});

test("no publish", () => {
  const dc = new DockerPublishJob(undefined as any, "publish", {
    imageName: "example",
    noPublish: true,
  });
  expect(dc.toGHAction()).toMatchSnapshot();
});

test("with overrides", () => {
  const dc = new DockerPublishJob(
    undefined as any,
    "publish",
    { imageName: "example" },
    { continueOnError: true }
  );
  expect(dc.toGHAction()).toMatchSnapshot();
});
