/*
 * This stack depends on the deployment of the "infra-k3s" stack.
 *
 * Please ensure the "infra-k3s" stack is UP before deploying this stack.
 *
 * This will likely also need to be deployed prior to the "app-homeassistant" stack.
 *
*/
import * as fs from "fs";
import { getStack, output } from "@pulumi/pulumi";
import { CustomResource } from "@pulumi/kubernetes/apiextensions";
import { Release } from "@pulumi/kubernetes/helm/v3";
import { Provider } from "@pulumi/kubernetes";
import { getInfraStackConfig } from "../bin/functions/infraConfig"
import { getCertManagerStackConfig } from "../bin/functions/certManagerConfig";

async function main() {
  // Obtain the infra-k3s config via stack references
  const infraConfigObj = await getInfraStackConfig();
  // Obtain the cert-manager config
  const certManagerConfigObj = await getCertManagerStackConfig();
  // Create a provider to interact with the kubernetes api server
  const provider = new Provider("k8s-provder", {
    kubeconfig: output(infraConfigObj.kubeConfigPath).apply(path => { return fs.readFileSync(path, "utf-8")}),
  });
  // Set the path for the local chart
  const chartPath = "./../../helm-charts/charts/cert-manager";
  // Deploy the cert-manager local chart
  // TODO: Update helm charts repo as environment-specific multi-repo
  const appChart = new Release("cert-manager",{
    chart: chartPath,
    // TODO: Update infra and deployment repo into environment-specific multi-repo
    namespace: infraConfigObj.homeAssistantNamespace,
    version: certManagerConfigObj.version
  },{
    provider: provider
  });
  // Define a cluster cert authority issuer
  const clusterIssuer = new CustomResource("letsencrypt-clusterissuer", {
    apiVersion: "cert-manager.io/v1",
    kind: "ClusterIssuer",
    metadata: {
      name: "letsencrypt-prod",
      namespace: infraConfigObj.homeAssistantNamespace,
      labels: {
        environment: getStack()
      }
    },
    spec: {
      acme: {
        server: "https://acme-v02.api.letsencrypt.org/directory",
        email: infraConfigObj.adminEmail,
        privateKeySecretRef: {
          name: "letsencrypt-prod",
        },
        solvers: [{
          http01: {
            ingress: {
              class: "nginx",
            },
          },
        }],
      }
    }
  },{
    provider: provider,
    dependsOn: appChart
  });
  // Define a
  const certificate = new CustomResource("homeassistant-certificate", {
    apiVersion: "cert-manager.io/v1",
    kind: "Certificate",
    metadata: {
      name: "homeassistant-certificate",
      labels: {
        app: "home-assistant",
        environment: getStack()
      }
    },
    spec: {
      secretName: `homeassistant-${getStack()}-tls`,
      issuerRef: {
        name: "letsencrypt-prod",
        kind: "ClusterIssuer",
      },
      commonName: "homeassistant.local",
      dnsNames: [
        "homeassistant.local",
        `${getStack()}.homeassistant.local`,
      ],
    },
  }, {
    provider: provider,
    dependsOn: clusterIssuer
  });
  // Return any stack output
  return {
    issuerName: clusterIssuer.metadata.name,
    certificateName: certificate.metadata.name
  }
}
// Export the custom values supplied to the helm chart
export const stackOutput = main();
