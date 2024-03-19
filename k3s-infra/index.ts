import * as pulumi from "@pulumi/pulumi";
import { iConnectionObj } from "./bin/interfaces/connection";
import { installK3s,
         copyKubeConfig,
         setKubeConfigEnv } from "./bin/functions/k3sInstallConfig";
import { installHelm } from "./bin/functions/helmInstallConfig";

async function main() {
  // Obtain pulumi configuration
  const config = new pulumi.Config("k3s-infra");
  // TODO 1a: Set wan server port and lan server port in pulumi config
  // TODO 1b: Test for network gateway host/ip to determine port to use
  // TODO 1c: Use port variable in connectionObj below
  // TODO 2a: Abstract connectionObj into its own module
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
}

// Call main async function
main();
