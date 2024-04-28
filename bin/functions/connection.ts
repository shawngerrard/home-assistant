import * as pulumi from "@pulumi/pulumi";
import { iConnectionObj } from "../interfaces/connection";

// Function to abstract obtaining server connection configuration from stack config
export async function getServerConnectionConfig() {
  // Obtain the current project name
  const projectName:string = pulumi.getProject();
  // Obtain the stack configuration
  const config = new pulumi.Config(projectName);
  // Create connection object using either config or stack references
  const configObj = projectName.includes("infra-") ? {
    host: config.require("serverIp"),
    port: 22,
    user: config.require("serverUser"),
    privateKey: config.requireSecret("serverKey")
  } as iConnectionObj : await getConnectionConfigFromStackOutput(config);
  // Return the config object
  return configObj;
}

// Supporting function for abstraction of getting server stack references
async function getConnectionConfigFromStackOutput(config: pulumi.Config): Promise<iConnectionObj> {
  // Obtain references to the server stack
  const stackRef = new pulumi.StackReference(`${config.require("org")}/${config.require("serverProject")}/${pulumi.getStack()}`);
  // Obtain the stack output references
  const connectionConfig = stackRef.getOutput("infraConfig");
  // Set connection object
  const connectionObj: iConnectionObj = {
    host: connectionConfig.apply(conn => {
      return conn.serverIp
    }),
    port: 22,
    user: connectionConfig.apply(conn => {
      return conn.serverUser
    }),
    privateKey: config.requireSecret("serverKey")
  }
  // Return the connection configuration
  return connectionObj;
}

// Function to abstract obtaining server kubeconfig path from stack config
export async function getServerKubeConfigPath() {
  // Obtain the current project name
  const projectName:string = pulumi.getProject();
  // Obtain the stack configuration
  const config = new pulumi.Config(projectName);
  // Create config object using either config or stack references
  const configObj = projectName.includes("infra-") ? pulumi.output(config.require("kubeConfigPath")) : await getKubeConfigFromStackOutput(config);
  // Return the config object
  return configObj;
}

// Supporting function for abstraction of getting server stack references
async function getKubeConfigFromStackOutput(config: pulumi.Config): Promise<pulumi.Output<any>> {
  // Obtain references to the server stack
  const stackRef = new pulumi.StackReference(`${config.require("org")}/${config.require("serverProject")}/${pulumi.getStack()}`);
  // Obtain the stack output references
  const kubeConfig = stackRef.getOutput("infraConfig");
  // Set kubeconfig object
  const kubeObj: pulumi.Output<any> = kubeConfig.apply(config => {
    return config.kubeConfigPath
  });
  // Return the connection configuration
  return kubeObj;
}

// Function to abstract obtaining admin email from stack config
export async function getAdminEmailConfig() {
  // Obtain the current project name
  const projectName:string = pulumi.getProject();
  // Obtain the stack configuration
  const config = new pulumi.Config(projectName);
  // Create config object using either config or stack references
  const configObj = projectName.includes("infra-") ? pulumi.output(config.require("adminEmail")) : await getAdminEmailFromStackOutput(config);
  // Return the config object
  return configObj;
}

// Supporting function for abstraction of getting server stack references
async function getAdminEmailFromStackOutput(config: pulumi.Config): Promise<pulumi.Output<any>> {
  // Obtain references to the server stack
  const stackRef = new pulumi.StackReference(`${config.require("org")}/${config.require("serverProject")}/${pulumi.getStack()}`);
  // Obtain the stack output references
  const adminEmail = stackRef.getOutput("infraConfig");
  // Set adminEmail object
  const adminEmailObj: pulumi.Output<any> = adminEmail.apply(config => {
    return config.adminEmail
  });
  // Return the connection configuration
  return adminEmailObj;
}
