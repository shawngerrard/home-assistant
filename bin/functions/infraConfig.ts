import * as pulumi from "@pulumi/pulumi";
import { iInfraStackConfig } from "../interfaces/config"

// Function to obtain stack configuration
export async function getInfraStackConfig() {
  // Obtain the current project name
  const projectName:string = pulumi.getProject();
  // Obtain the stack configuration
  const config = new pulumi.Config(projectName);
  // Create infra stack config object using either config or stack references
  const stackConfigObj = projectName.includes("infra-k3s") ? {
    homeAssistantNamespace: config.require("homeAssistantNamespace"),
    adminEmail: config.require("adminEmail"),
    kubeConfigPath: config.require("kubeConfigPath"),
    serverIp: config.require("serverIp"),
    storageClassName: config.require("serverVolumeStorageClass"),
    persistentVolumeMountPath: config.require("serverVolumeMountPath")
  } as iInfraStackConfig : await getInfraStackConfigFromStackOutput(config);
  // Return the infra stack configuration
  return stackConfigObj;
}

// Supporting function to obtain server stack references
async function getInfraStackConfigFromStackOutput(config: pulumi.Config): Promise<iInfraStackConfig> {
  // Obtain references to the server stack
  const stackRef = new pulumi.StackReference(`${config.require("org")}/${config.require("serverProject")}/${pulumi.getStack()}`);
  // Obtain the stack output references
  const infraConfig = stackRef.getOutput("infraConfig");
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
