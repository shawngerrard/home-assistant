import * as pulumi from "@pulumi/pulumi";
import { iConnectionObj } from "../interfaces/connection";

// Function to abstract obtaining server connection configuration
export async function getServerConnectionConfig() {
  // Obtain the current project name
  const projectName:string = pulumi.getProject();
  // Obtain the stack configuration
  const config = new pulumi.Config(projectName);
  // Create connection object using either config or stack references
  const connectionObj = projectName.includes("infra-") ? {
    host: config.require("serverIp"),
    port: 22,
    user: config.require("serverUser"),
    privateKey: config.requireSecret("serverKey")
  } as iConnectionObj : await getConnectionConfigFromStackOutput(config);
  // Return the connection configuration
  return connectionObj;
}

// Function to abstract obtaining server stack references
async function getConnectionConfigFromStackOutput(config: pulumi.Config): Promise<iConnectionObj> {
  // Obtain references to the server stack
  const stackRef = new pulumi.StackReference(`${config.require("org")}/${config.require("serverProject")}/${pulumi.getStack()}`);
  // Obtain the stack output references
  const connectionConfig = stackRef.getOutput("connectionConfig");
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
