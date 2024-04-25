/*
 * This stack depends on the deployment of the "infra-k3s" stack.
 *
 * Please ensure the "infra-k3s" stack is UP before deploying this stack.
 *
 * This will likely also need to be deployed prior to the "app-homeassistant" stack.
 *
*/

import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { getInfraStackConfig } from "../bin/functions/infraConfig";

async function main() {
  // Set the path for the local chart
  const chartPath = "./../../helm-charts/charts/nginx-ingress";
  // Set the namespace name to create/use for the chart
  const chartNamespace = `home-assistant-${pulumi.getStack()}`;
  // Create a k3s namespace that nginx will manage
  const createNamespace = new k8s.core.v1.Namespace(`Create ${chartNamespace} namespace`, {
    metadata: {
      name: chartNamespace
    }
  });
  const infraConfigObj = await getInfraStackConfig();
  // Deploy the home-assistant local chart
  // TODO: Update helm charts repo as environment-specific multi-repo
  const appChart = new k8s.helm.v3.Chart("nginx",{
    path: chartPath,
    // TODO: Update infra and deployment repo into environment-specific multi-repo
    namespace: chartNamespace
  },{
    dependsOn: createNamespace
  });
  // Return the connection object for output (testing)
  return appChart.getResource("apps/v1/Deployment", "nginx").metadata.name.apply(name => { return name });
}
// Export the custom values supplied to the helm chart
export const customServiceValues = main();
