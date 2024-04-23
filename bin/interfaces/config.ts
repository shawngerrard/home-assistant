import * as pulumi from "../../node_modules/@pulumi/pulumi";

/* This file defines the interface for the infra-k3s stack config used throughout the project */
export interface iInfraStackConfig {
  storageClassName: string | pulumi.Output<any>,
  persistentVolumeMountPath: string | pulumi.Output<any>
}
