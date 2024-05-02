/*
 * This stack depends on the deployment of the "infra-k3s" stack.
 *
 * Please ensure the "infra-k3s" stack is UP before deploying this stack.
 *
 * This will likely also need to be deployed prior to the "app-homeassistant" stack.
 *
*/
import * as fs from "fs";
import { Config, getProject, getStack, output } from "@pulumi/pulumi";
import { CustomResource } from "@pulumi/kubernetes/apiextensions";
import { Provider } from "@pulumi/kubernetes";
import { getInfraStackConfigFromStackOutput } from "../bin/functions/infraConfig"
import { getCertManagerStackConfig } from "../bin/functions/certManagerConfig";
import { CertManager } from "@pulumi/kubernetes-cert-manager";

async function main() {
  // Obtain the stack configuration
  const stackConfig = new Config(getProject());
  // Obtain the infra config via stack references
  const infraStackRefObj = await getInfraStackConfigFromStackOutput(stackConfig);
  // Obtain the cert-manager config
  const certManagerConfigObj = await getCertManagerStackConfig(getProject(), stackConfig);
  // Create a provider to interact with the kubernetes api server
  const provider = new Provider("k8s-provder", {
    kubeconfig: output(infraStackRefObj.kubeConfigPath).apply(path => { return fs.readFileSync(path, "utf-8")}),
    namespace: infraStackRefObj.homeAssistantNamespace
  });
  const certManager = new CertManager("cert-manager",{
    helmOptions:{
      namespace: infraStackRefObj.homeAssistantNamespace,
      version: certManagerConfigObj.version
    },
    installCRDs: true,
    podLabels: {
      app: "home-assistant",
      environment: getStack()
    },
    serviceLabels: {
      app: "home-assistant",
      environment: getStack()
    }
  },{
    provider: provider
  });
  // Define a cluster cert authority issuer
  const clusterIssuer = new CustomResource("letsencrypt-clusterissuer", {
    apiVersion: "cert-manager.io/v1",
    kind: "ClusterIssuer",
    metadata: {
      name: "letsencrypt-prod",
      namespace: infraStackRefObj.homeAssistantNamespace,
      labels: {
        environment: getStack()
      }
    },
    spec: {
      acme: {
        server: "https://acme-v02.api.letsencrypt.org/directory",
        email: infraStackRefObj.adminEmail,
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
    dependsOn: certManager
  });
  // Define a certificate resource
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
    certManagerProject: certManagerConfigObj.certManagerProject,
    certificateName: certificate.metadata.name,
    issuerName: clusterIssuer.metadata.name,
    version: certManagerConfigObj.version
  }
}
// Export the custom values supplied to the helm chart
export const certManagerStackOutput = main();
