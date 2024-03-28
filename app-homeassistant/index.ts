/*
 * This stack depends on the deployment of the "infra-k3s" stack.
 *
 * Please ensure the "infra-k3s" stack is UP before deploying this stack.
*/

import * as k8s from "@pulumi/kubernetes";
import { getServerConnectionConfig } from "../bin/functions/connection";

async function main() {
  // Obtain the server connection object
  const connectionObj = await getServerConnectionConfig();
  // Return the connection object for output (testing)
  return connectionObj;
}
// Export the connection object (testing)
export const connectionObj = main();
