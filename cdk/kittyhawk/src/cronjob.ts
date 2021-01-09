import { Construct } from 'constructs';
import { KubeCronJobV1Beta1 as CronJobApiObject } from '../imports/k8s';
import { Container, ContainerProps, Volume } from './container';

export interface CronJobProps extends ContainerProps {

  /**
     * The schedule in Cron format.
     */
  readonly schedule: string;

  /**
    * Restart policy for all containers.
    * 
    * @default "Never"
    * 
    */

  readonly restartPolicy?: 'Always' | 'OnFailure' | 'Never';

  /**
    * The number of successful finished jobs to retain. 
    * 
    * @default 1
    * 
    */
  readonly successLimit?: number;

  /**
    * The number of failed jobs to retain.
    * 
    * @default 1
    * 
    */
  readonly failureLimit?: number;

  /**
    * Secret volume mounts for cronjob container.
    *
    * @default undefined
    */
  readonly secretMounts?: { name: string, mountPath: string, subPath: string }[]

}


export class CronJob extends Construct {
  constructor(scope: Construct, jobname: string, props: CronJobProps) {
    super(scope, jobname);

    // We want to prepend the project name to the name of each component
    const release_name = process.env.RELEASE_NAME || 'undefined_release';
    const fullname = `${release_name}-${jobname}`
    const containers: Container[] = [new Container(props)];
    const volumes: Volume[] | undefined = props.secretMounts?.map(m => new Volume(m))

    new CronJobApiObject(this, `cronjob-${fullname}`, {
      metadata: {
        name: fullname,
        namespace: 'default',
        labels: { name: fullname },
      },
      spec: {
        schedule: props.schedule,
        jobTemplate: {
          spec: {
            template: {
              spec: {
                restartPolicy: props.restartPolicy || 'Never',
                containers: containers,
                volumes: volumes,
              },
            },

          },
        },
        failedJobsHistoryLimit: props.failureLimit ?? 1,
        successfulJobsHistoryLimit: props.successLimit ?? 1,
      },
    });
  }
}