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
  // Create kubernetes provider resource
  const provider = new k8s.Provider("kubernetes provider", {

  },{})
  // Deploy the home-assistant remote chart
  const appChart = new k8s.helm.v3.Chart("home-assistant-chart", {
    chart: "home-assistant",
    fetchOpts: {
      repo: "http://pajikos.github.io/home-assistant-helm-chart/"
    },
    values: {
      service: {
        type: "NodePort",
        port: 30001
      }
    }
  });
  // Return the connection object for output (testing)
  return connectionObj;
}
// Export the connection object (testing)
export const connectionObj = main();
