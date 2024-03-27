import * as pulumi from "@pulumi/pulumi";
import { iConnectionObj } from "../bin/interfaces/connection";
import { installK3s,
         copyKubeConfig,
         setKubeConfigEnv } from "./functions/k3sInstall";
import { installHelm } from "./functions/helmInstall";

async function main() {
  // Obtain pulumi configuration
  const config = new pulumi.Config("infra-k3s");
  // Create connection object using the type interface
  const connectionObj = {
    host: config.require("serverIp"),
    port: 22,
    user: config.require("serverUser"),
    privateKey: config.requireSecret("serverKey")
  } as iConnectionObj;
  // Log config
  console.log(config);
  // Install k3s on server
  const installKube = await installK3s(connectionObj);
  // Configure cluster access on server
  const kubeConfig = await copyKubeConfig(connectionObj, installKube);
  // Create kubeconfig environment variable
  const kubeEnvVar = await setKubeConfigEnv(connectionObj, kubeConfig);
  // Install helm on server
  const installHelmCli = await installHelm(connectionObj, kubeEnvVar);

  // Return connection configuration
  return {
    serverIp: connectionObj.host,
    serverPort: connectionObj.port,
    serverUser: connectionObj.user
  };
}

// Call main async function
export const connectionConfig = main();
