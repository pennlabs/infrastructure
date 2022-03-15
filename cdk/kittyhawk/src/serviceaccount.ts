import { Construct } from "constructs";
import { defaultChildName } from "./utils";
import { KubeServiceAccount } from "./imports/k8s";

export interface ServiceAccountProps {
  readonly serviceAccountName: string;
}

export class ServiceAccount extends Construct {
  constructor(scope: Construct, appname: string, props: ServiceAccountProps) {
    super(scope, appname);

    const awsAccountId = process.env.AWS_ACCOUNT_ID;
    if (!awsAccountId) {
      console.error("No AWS_ACCOUNT_ID environment variable provided.");
      process.exit(1);
    }

    new KubeServiceAccount(this, defaultChildName, {
      metadata: {
        name: props.serviceAccountName,
        annotations: {
          ["eks.amazonaws.com/role-arn"]: `arn:aws:iam::${awsAccountId}:role/${props.serviceAccountName}`,
        },
      },
    });
  }
}
