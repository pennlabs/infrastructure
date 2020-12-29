import { JobProps, Workflow } from 'cdkactions';
import { DockerPublishJob, DockerPublishJobProps } from './docker';
import { ReactCheckJob, ReactCheckJobProps } from './react';
import { buildId } from './utils';


export interface ReactProjectProps {
  id?: string;
  path?: string;
  imageName: string;
  checkProps?: Partial<ReactCheckJobProps>;
  checkOverrides?: Partial<JobProps>;
  publishProps?: Partial<DockerPublishJobProps>;
  publishOverrides?: Partial<JobProps>;
}

export class ReactProject {
  public readonly publishJobId: string;
  public constructor(workflow: Workflow, config: ReactProjectProps) {
    // Build config
    const fullConfig: Required<ReactProjectProps> = {
      id: '',
      path: '.',
      checkProps: {},
      checkOverrides: {},
      publishProps: {},
      publishOverrides: {},
      ...config,
    };

    // Add jobs
    const reactCheckJob = new ReactCheckJob(workflow,
      {
        id: fullConfig.id,
        path: fullConfig.path,
        ...config.checkProps,
      },
      fullConfig.checkOverrides,
    );

    const publishJob = new DockerPublishJob(workflow, buildId('frontend', fullConfig.id),
      {
        imageName: fullConfig.imageName,
        path: fullConfig.path,
        ...fullConfig.publishProps,
      },
      {
        needs: reactCheckJob.id
        , ...fullConfig.publishOverrides,
      });

    // Set publishJobID
    this.publishJobId = publishJob.id;
  }
}
