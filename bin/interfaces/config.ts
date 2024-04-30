import * as pulumi from "../../node_modules/@pulumi/pulumi";

// Define an interface for the infra-k3s stack config used throughout the project
export interface iInfraStackConfig {
  homeAssistantNamespace: string | pulumi.Output<any>,
  adminEmail: string | pulumi.Output<any>,
  kubeConfigPath: string | pulumi.Output<any>,
  serverIp: string | pulumi.Output<any>,
  storageClassName: string | pulumi.Output<any>,
  persistentVolumeMountPath: string | pulumi.Output<any>
}

// Define an interface for stack configs used throughout the project
export interface iStackConfig<T> {
  [key: string]: pulumi.Output<T> | T
}

// Define an interface for the app-certmanager config
export interface iCertManagerStackConfig {
  version: string | pulumi.Output<any>,
  certManagerProject: string | pulumi.Output<any>
}
