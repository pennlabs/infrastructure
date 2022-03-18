import { Construct } from "constructs";
import { KubeService as ServiceApiObject, IntOrString } from "./imports/k8s";
import { defaultChildName } from "./utils";

export class Service extends Construct {
  constructor(scope: Construct, appname: string, port?: number) {
    super(scope, `service-${appname}`);

    const targetPort = port ?? 80;

    new ServiceApiObject(this, defaultChildName, {
      metadata: {
        name: appname,
      },
      spec: {
        type: "ClusterIP",
        ports: [
          { port: targetPort, targetPort: IntOrString.fromNumber(targetPort) },
        ],
        selector: { "app.kubernetes.io/name": appname },
      },
    });
  }
}
