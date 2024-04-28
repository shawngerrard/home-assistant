/*
 * This stack depends on the deployment of the "infra-k3s" stack.
 *
 * Please ensure the "infra-k3s" stack is UP before deploying this stack.
 *
 * This will likely also need to be deployed prior to the "app-homeassistant" stack.
 *
*/
import { Chart } from "@pulumi/kubernetes/helm/v3";
import { getInfraStackConfig } from "../bin/functions/infraConfig";

async function main() {
  // Obtain the infra-k3s config via stack references
  const infraConfigObj = await getInfraStackConfig();
  // Set the path for the local chart
  const chartPath = "./../../helm-charts/charts/nginx-ingress";
  // Deploy the nginx-ingress-controller local chart
  // TODO: Update helm charts repo as environment-specific multi-repo
  const appChart = new Chart("nginx",{
    path: chartPath,
    // TODO: Update infra and deployment repo into environment-specific multi-repo
    namespace: infraConfigObj.homeAssistantNamespace
  });
  // Return the connection object for output (testing)
  return "";
}
// Export the custom values supplied to the helm chart
export const customServiceValues = main();
