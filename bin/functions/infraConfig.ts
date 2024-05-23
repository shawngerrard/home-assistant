import { Config, getStack, output, StackReference } from "@pulumi/pulumi";
import { iInfraStackConfig } from "../interfaces/config"

// Function to obtain stack configuration
export async function getInfraStackConfig(stackConfig: Config) {
  // Create infra stack config object using either config or stack references
  const stackConfigObj: iInfraStackConfig = {
    homeAssistantNamespace: stackConfig.require("homeAssistantNamespace"),
    adminEmail: stackConfig.require("adminEmail"),
    kubeConfigPath: stackConfig.require("kubeConfigPath"),
    serverIp: stackConfig.require("serverIp"),
    serverUser: stackConfig.require("serverUser"),
    serverPort: output(22).apply(val => val),
    storageClassName: stackConfig.require("serverVolumeStorageClass"),
    persistentVolumeMountPath: stackConfig.require("serverVolumeMountPath")
  };
  // Return the infra stack configuration
  return stackConfigObj;
}

// Supporting function to obtain server stack references
export async function getInfraStackConfigFromStackOutput(stackConfig: Config): Promise<iInfraStackConfig> {
  // Obtain references to the server stack
  const stackRef = new StackReference(`${stackConfig.require("org")}/${stackConfig.require("serverProject")}/${getStack()}`);
  // Obtain the stack output references
  const infraConfig = stackRef.getOutput("infraStackOutput");
  // Set the infra stack config object
  const infraStackConfigObj: iInfraStackConfig = {
    homeAssistantNamespace: infraConfig.apply(ref => {
      return ref.homeAssistantNamespace
    }),
    adminEmail: infraConfig.apply(ref => {
      return ref.adminEmail
    }),
    kubeConfigPath: infraConfig.apply(ref => {
      return ref.kubeConfigPath
    }),
    serverIp: infraConfig.apply(ref => {
      return ref.serverIp
    }),
    serverUser: infraConfig.apply(ref => {
      return ref.serverUser
    }),
    serverPort:infraConfig.apply(ref => {
      return ref.serverPort
    }),
    storageClassName: infraConfig.apply(ref => {
      return ref.serverVolumeStorageClass
    }),
    persistentVolumeMountPath: infraConfig.apply(ref => {
      return ref.serverVolumeMountPath
    })
  }
  // Return the connection configuration
  return infraStackConfigObj;
}
