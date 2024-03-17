import * as pulumi from "@pulumi/pulumi";
import { iConnectionObj } from "./bin/interfaces";
import { installK3s, configKubectl } from "./bin/k3sFunctions";

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
  // Run pulumi commands to install k3s and helm on server
  const installKube = await installK3s(connectionObj);
  // Run pulumi commands to configure cluster access on server
  const kubeConfig = await configKubectl(connectionObj, installKube);
}

// Call main async function
main();
