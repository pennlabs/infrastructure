import { JobProps, Workflow } from 'cdkactions';
import { DjangoCheckJob, DjangoCheckJobProps } from './django';
import { DockerPublishJob, DockerPublishJobProps } from './docker';

export interface DjangoProjectProps {
  id?: string;
  projectName: string;
  path?: string;
  imageName: string;
  checkProps?: Partial<DjangoCheckJobProps>;
  checkOverrides?: Partial<JobProps>;
  publishProps?: Partial<DockerPublishJobProps>;
  publishOverrides?: Partial<JobProps>;
}

export class DjangoProject {
  public readonly publishJobId: string;
  public constructor(workflow: Workflow, config: DjangoProjectProps) {
    // Build config
    const fullConfig: Required<DjangoProjectProps> = {
      id: '',
      path: '.',
      checkProps: {},
      checkOverrides: {},
      publishProps: {},
      publishOverrides: {},
      ...config,
    };

    const suffix = fullConfig.id ? `-${fullConfig.id}` : '';

    // Add jobs
    const djangoCheckJob = new DjangoCheckJob(workflow,
      {
        projectName: fullConfig.projectName,
        path: fullConfig.path,
        ...config.checkProps,
      },
      fullConfig.checkOverrides,
    );

    const publishJob = new DockerPublishJob(workflow, `backend${suffix}`,
      {
        imageName: fullConfig.imageName,
        path: fullConfig.path,
        ...fullConfig.publishProps,
      },
      {
        needs: djangoCheckJob.id
        , ...fullConfig.publishOverrides,
      });

    // Set publishJobID
    this.publishJobId = publishJob.id;
  }
}
