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
  // Specify custom template settings for service in Helm values file
  // TODO: Update home-assistant helm chart values file to accept the following properties (rather than update here?)
  // TODO: Update NodePort to use either a LoadBalancer service or a ClusterIP service using an ingress resource
  /* These need to be updated to suit nginx
  const customServiceValues = {
    service: {
      type: "NodePort",
      port: 8080,
      nodePort: 30001
    },
    persistence: {
      enabled: "true",
      size: "500Gi",
      accessModes: ["ReadWriteOnce"],
      storageClass: infraConfigObj.storageClassName
    }
  };
  // Deploy the home-assistant local chart
  // TODO: Update helm charts repo as environment-specific multi-repo
  const appChart = new k8s.helm.v3.Chart("nginx",{
    path: chartPath,
    // TODO: Update infra and deployment repo into environment-specific multi-repo
    namespace: chartNamespace,
    values: customServiceValues
  },{
    dependsOn: createNamespace
  });
  // Return the connection object for output (testing)
  */
  return "";
}
// Export the custom values supplied to the helm chart
//export const customServiceValues = main();
