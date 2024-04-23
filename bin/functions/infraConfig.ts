import * as pulumi from "@pulumi/pulumi";
import { iInfraStackConfig } from "../interfaces/config"

// Function to abstract obtaining infra stack configuration
export async function getInfraStackConfig() {
  // Obtain the current project name
  const projectName:string = pulumi.getProject();
  // Obtain the stack configuration
  const config = new pulumi.Config(projectName);
  // Create infra stack config object using either config or stack references
  const infraStackConfigObj = projectName.includes("infra-") ? {
    storageClassName: config.require("serverStorageClass"),
    persistentVolumeMountPath: config.require("serverVolumeMountPath")
  } as iInfraStackConfig : await getInfraStackConfigFromStackOutput(config);
  // Return the infra stack configuration
  return infraStackConfigObj;
}

// Supporting function to aid abstraction of getting server stack references
async function getInfraStackConfigFromStackOutput(config: pulumi.Config): Promise<iInfraStackConfig> {
  // Obtain references to the server stack
  const stackRef = new pulumi.StackReference(`${config.require("org")}/${config.require("serverProject")}/${pulumi.getStack()}`);
  // Obtain the stack output references
  const infraConfig = stackRef.getOutput("infraConfig");
  // Set the infra stack config object
  const infraStackConfigObj: iInfraStackConfig = {
    storageClassName: infraConfig.apply(config => {
      return config.serverStorageClass
    }),
    persistentVolumeMountPath: infraConfig.apply(config => {
      return config.serverVolumeMountPath
    })
  }
  // Return the connection configuration
  return infraStackConfigObj;
}
