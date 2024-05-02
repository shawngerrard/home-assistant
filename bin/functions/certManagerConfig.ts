import { Config, getStack, StackReference } from "@pulumi/pulumi";
import { iCertManagerStackConfig } from "../interfaces/config"

// Function to abstract obtaining cert-manager stack configuration
export async function getCertManagerStackConfig(stackConfig: Config): Promise<iCertManagerStackConfig>{
  // Create infra stack config object
  const stackConfigObj: iCertManagerStackConfig = {
    certSecretName: stackConfig.require("certSecretName"),
    org: stackConfig.require("org"),
    serverProject: stackConfig.require("serverProject"),
    version: stackConfig.require("version")
  };
  // Return the cert-manager stack configuration
  return stackConfigObj;
}

// Supporting function to aid abstraction of getting server stack references
export async function getCertManagerStackConfigFromStackOutput(stackConfig: Config): Promise<iCertManagerStackConfig> {
  // Obtain references to the server stack
  const stackRef = new StackReference(`${stackConfig.require("org")}/${stackConfig.require("certManagerProject")}/${getStack()}`);
  // Obtain the stack output references
  const certManagerConfig = stackRef.getOutput("certManagerStackOutput");
  // Set the infra stack config object
  const certManagerStackConfigObj: iCertManagerStackConfig = {
    certSecretName: certManagerConfig.apply(ref => {
      return ref.certSecretName
    }),
    org: certManagerConfig.apply(ref => {
      return ref.org
    }),
    serverProject: certManagerConfig.apply(ref => {
      return ref.serverProject
    }),
    version: certManagerConfig.apply(ref => {
      return ref.version
    }),
  }
  // Return the connection configuration
  return certManagerStackConfigObj;
}
