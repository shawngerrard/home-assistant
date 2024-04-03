/*
 * This stack depends on the deployment of the "infra-k3s" stack.
 *
 * Please ensure the "infra-k3s" stack is UP before deploying this stack.
*/

import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { getServerConnectionConfig } from "../bin/functions/connection";

async function main() {
  // Set the path for the local chart
  const chartPath = "./../../helm-charts/charts/home-assistant";
  // TODO: Create a function to create k3s namespaces rather than using kube/namespace.yaml
  // Obtain the server connection object
  const connectionObj = await getServerConnectionConfig();
  // Specify custom template settings for service in Helm values file
  // TODO: Update home-assistant helm chart values file to accept the following properties
  // TODO: Update NodePort to use either a LoadBalancer service or a ClusterIP service using an ingress resource
  const customServiceValues = {
    service: {
      type: "NodePort",
      ports: [{
        port: 8080,
        targetPort: 8080,
        nodePort: 30001
      }]
    }
  };
  // Deploy the home-assistant remote chart
  // TODO: Update helm charts repo as environment-specific multi-repo
  const appChart = new k8s.helm.v3.Chart(`Deploy ${pulumi.getStack()} home-assistant helm chart`,{
    path: chartPath,
    // TODO: Update infra and deployment repo into environment-specific multi-repo
    namespace: `app-homeassistant-${pulumi.getStack()}`,
    values: customServiceValues
  });
  // Return the connection object for output (testing)
  return connectionObj;
}
// Export the connection object (testing)
export const connectionObj = main();
