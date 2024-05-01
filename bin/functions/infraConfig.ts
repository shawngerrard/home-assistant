import * as pulumi from "@pulumi/pulumi";
import { iInfraStackConfig } from "../interfaces/config"

// Function to obtain stack configuration
export async function getInfraStackConfig(stackConfig: pulumi.Config) {
  // Obtain the current project name
  //const projectName:string = pulumi.getProject();
  // Obtain the stack configuration
  //const config = new pulumi.Config(projectName);
  // Create infra stack config object using either config or stack references
  const stackConfigObj = {
    homeAssistantNamespace: stackConfig.require("homeAssistantNamespace"),
    adminEmail: stackConfig.require("adminEmail"),
    kubeConfigPath: stackConfig.require("kubeConfigPath"),
    serverIp: stackConfig.require("serverIp"),
    storageClassName: stackConfig.require("serverVolumeStorageClass"),
    persistentVolumeMountPath: stackConfig.require("serverVolumeMountPath")
  } as iInfraStackConfig;
  // Return the infra stack configuration
  return stackConfigObj;
}

// Supporting function to obtain server stack references
export async function getInfraStackConfigFromStackOutput(stackConfig: pulumi.Config): Promise<iInfraStackConfig> {
  // Obtain references to the server stack
  const stackRef = new pulumi.StackReference(`${stackConfig.require("org")}/${stackConfig.require("serverProject")}/${pulumi.getStack()}`);
  // Obtain the stack output references
  const infraConfig = stackRef.getOutput("infraStackOutput");
  // Set the infra stack config object
  const infraStackConfigObj: iInfraStackConfig = {
    homeAssistantNamespace: infraConfig.apply(config => {
      return config.homeAssistantNamespace
    }),
    adminEmail: infraConfig.apply(config => {
      return config.adminEmail
    }),
    kubeConfigPath: infraConfig.apply(config => {
      return config.kubeConfigPath
    }),
    serverIp: infraConfig.apply(config => {
      return config.serverIp
    }),
    storageClassName: infraConfig.apply(config => {
      return config.serverVolumeStorageClass
    }),
    persistentVolumeMountPath: infraConfig.apply(config => {
      return config.serverVolumeMountPath
    })
  }
  // Return the connection configuration
  return infraStackConfigObj;
}
