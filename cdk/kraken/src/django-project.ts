import { JobProps, Workflow } from 'cdkactions';
import { DjangoCheckJob, DjangoCheckJobProps } from './django';
import { DockerPublishJob, DockerPublishJobProps } from './docker';
import { buildId } from './utils';

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

    // Add jobs
    const djangoCheckJob = new DjangoCheckJob(workflow,
      {
        id: fullConfig.id,
        projectName: fullConfig.projectName,
        path: fullConfig.path,
        ...config.checkProps,
      },
      fullConfig.checkOverrides,
    );

    const publishJob = new DockerPublishJob(workflow, buildId('backend', fullConfig.id),
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
