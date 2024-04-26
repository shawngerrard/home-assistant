/*
 * This stack depends on the deployment of the "infra-k3s" stack.
 *
 * Please ensure the "infra-k3s" stack is UP before deploying this stack.
*/

import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { getInfraStackConfig } from "../bin/functions/infraConfig";

async function main() {
  // Obtain the infra-k3s stack configuration
  const infraConfigObj = await getInfraStackConfig();
  // Set the path for the local chart
  const chartPath = "./../../helm-charts/charts/home-assistant";
  // Specify custom template settings for service in Helm values file
  // TODO: Update home-assistant helm chart values file to accept the following properties (rather than update here?)
  // TODO: Update NodePort to use either a LoadBalancer service or a ClusterIP service using an ingress resource
  const customServiceValues = {
    ingress: {
      enabled: true,
      className: "nginx",
      hosts: [{
        host: "dev.homeassistant.local",
        paths: [{
          path: "/",
          pathType: "Prefix"
        }],
      }]
    },
    service: {
      port: 8080
    },
    /* Deprecated - replaced with nginx-ingress-controller
    service: {
      type: "NodePort",
      port: 8080,
      nodePort: 30001
    },*/
    persistence: {
      enabled: "true",
      size: "500Gi",
      accessModes: ["ReadWriteOnce"],
      storageClass: infraConfigObj.storageClassName
    }
  };
  // Deploy the home-assistant local chart
  // TODO: Update helm charts repo as environment-specific multi-repo
  const appChart = new k8s.helm.v3.Chart("home-assistant",{
    path: chartPath,
    // TODO: Update infra and deployment repo into environment-specific multi-repo
    namespace: infraConfigObj.homeAssistantNamespace,
    values: customServiceValues
  });
  // Return the connection object for output (testing)
  return customServiceValues;
}
// Export the custom values supplied to the helm chart
export const customServiceValues = main();
