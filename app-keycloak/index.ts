/*
 * This stack depends on the deployment of the "infra-k3s" stack.
 *
 * Please ensure the "infra-k3s" stack is UP before deploying this stack.
 *
 * This will likely also need to be deployed prior to the "app-homeassistant" stack.
 *
*/
import { Chart } from "@pulumi/kubernetes/helm/v3";
import { getInfraStackConfigFromStackOutput } from "../bin/functions/infraConfig";
import { getCertManagerStackConfigFromStackOutput } from "../bin/functions/certManagerConfig"
import { Config, interpolate, getProject, getStack } from "@pulumi/pulumi";

async function main() {
  // Obtain the stack config
  const config = new Config(getProject());
  // Obtain the infra-k3s stack output references
  const infraConfigObj = await getInfraStackConfigFromStackOutput(config);
  // Obtain the app-certmanager stack output references
  const certManagerConfigObj = await getCertManagerStackConfigFromStackOutput(config);
  // Set the path for the local chart
  const chartPath = "./../../helm-charts/charts/keycloak";
  // Define custom values
    //
    //
    //
  const customChartValues = {
    ingress: {
      annotations: {
        "kubernetes.io/ingress.class": "nginx",
        "cert-manager.io/cluster-issuer": "letsencrypt-prod"
      },
      enabled: true,
      ingressClassName: "nginx",
      tls: true,
      hostname: "keycloak.servusmachina.com",
      path: "/",
      extraPaths: [
        {
          path: "/.well-known/acme-challenge",
          pathType: "ImplementationSpecific",
          backend: {
            service: {
              name: "keycloak",
              port: {
                number: 80
              }
            }
          }
      }]
    },
    adminIngress: {
      annotations: {
        "kubernetes.io/ingress.class": "nginx",
        "cert-manager.io/cluster-issuer": "letsencrypt-prod"
      },
      enabled: true,
      ingressClassName: "nginx",
      tls: true,
      hostname: "keycloak-admin.servusmachina.com",
      path: "/",
      extraPaths: [
        {
          path: "/.well-known/acme-challenge",
          pathType: "ImplementationSpecific",
          backend: {
            service: {
              name: "keycloak",
              port: {
                number: 80
              }
            }
          }
      }]
    },
    keycloakConfigCli: {
      enabled: true,
      configuration: {
        "master.json": JSON.stringify({
            realm : "master",
            attributes: {
              frontendUrl: "https://keycloak-admin.servusmachina.com"
            }
        })
      }
    }
  };
  // Deploy the nginx-ingress-controller local chart
  // TODO: Update helm charts repo as environment-specific multi-repo
  const appChart = new Chart("keycloak",{
    path: chartPath,
    // TODO: Update infra and deployment repo into environment-specific multi-repo
    namespace: infraConfigObj.homeAssistantNamespace,
    values: customChartValues
  },{});
  // Return the connection object for output (testing)
  return "";
}
// Export the custom values supplied to the helm chart
export const keycloakStackOutput = main();
