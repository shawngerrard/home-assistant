import * as pulumi from "@pulumi/pulumi";
import { iCertManagerStackConfig } from "../interfaces/config"

// Function to abstract obtaining cert-manager stack configuration
export async function getCertManagerStackConfig() {
  // Obtain the current project name
  const projectName:string = pulumi.getProject();
  // Obtain the stack configuration
  const config = new pulumi.Config(projectName);
  // Create infra stack config object using either config or stack references
  const infraStackConfigObj = projectName.includes("infra-k3s") ? {
    version: config.require("version"),
  } as iCertManagerStackConfig : await getCertManagerStackConfigFromStackOutput(config);
  // Return the cert-manager stack configuration
  return infraStackConfigObj;
}

// Supporting function to aid abstraction of getting server stack references
async function getCertManagerStackConfigFromStackOutput(config: pulumi.Config): Promise<iCertManagerStackConfig> {
  // Obtain references to the server stack
  const stackRef = new pulumi.StackReference(`${config.require("org")}/${config.require("serverProject")}/${pulumi.getStack()}`);
  // Obtain the stack output references
  const certManagerConfig = stackRef.getOutput("infraConfig");
  // Set the infra stack config object
  const certManagerStackConfigObj: iCertManagerStackConfig = {
    version: certManagerConfig.apply(config => {
      return config.homeAssistantNamespace
    }),
  }
  // Return the connection configuration
  return certManagerStackConfigObj;
}
