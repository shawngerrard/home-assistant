/*
 * This stack depends on the deployment of the "infra-k3s" stack.
 *
 * Please ensure the "infra-k3s" stack is UP before deploying this stack.
*/
import * as k8s from "@pulumi/kubernetes";
import { Config, getProject, getStack } from "@pulumi/pulumi";
import { getInfraStackConfigFromStackOutput } from "../bin/functions/infraConfig";

async function main() {
  // Obtain the stack config
  const config = new Config(getProject());
  // Obtain the infra-k3s stack configuration
  const infraConfigObj = await getInfraStackConfigFromStackOutput(config);
  // Set the path for the local chart
  const chartPath = "./../../helm-charts/charts/home-assistant";
  // Specify custom template settings for service in Helm values file
  const customChartValues = {
    ingress: {
      annotations: {
        "nginx.ingress.kubernetes.io/limit-rps": "5", // limit request per seconds multiplied by default burst-multiplier (5)
        "nginx.ingress.kubernetes.io/limit-connections": "1", // limit per ip
        "nginx.ingress.kubernetes.io/proxy-body-size": "30M", // limit request proxy body site to 30 megabytes
      },
      enabled: true,
      className: "nginx",
      hosts: [{
        host: "dev.homeassistant.local",
        paths: [{
          path: "/",
          pathType: "Prefix"
        }],
      }],
      tls: [{
        secretName: "tls-secret",
        hosts: ["homeassistant.local","dev.homeassistant.local"]
      }]
    },
    service: {
      port: 443
    },
    persistence: {
      enabled: "true",
      size: "500Gi",
      accessModes: ["ReadWriteOnce"],
      storageClass: infraConfigObj.storageClassName
    },
    podAnnotations: {
      app: "home-assistant",
      environment: getStack()
    }
  };
  // Deploy the home-assistant local chart
  // TODO: Update helm charts repo as environment-specific multi-repo
  const appChart = new k8s.helm.v3.Chart("home-assistant",{
    path: chartPath,
    // TODO: Update infra and deployment repo into environment-specific multi-repo
    namespace: infraConfigObj.homeAssistantNamespace,
    values: customChartValues
  });
  // Return the connection object for output (testing)
  return customChartValues;
}
// Export the custom values supplied to the helm chart
export const homeAssistantStackOutput = main();
