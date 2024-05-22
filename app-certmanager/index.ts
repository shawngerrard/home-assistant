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
import * as k8s from "@pulumi/kubernetes";

async function main() {
  // Obtain the stack configuration
  const stackConfig = new Config(getProject());
  // Obtain the infra config via stack references
  const infraStackRefObj = await getInfraStackConfigFromStackOutput(stackConfig);
  // Obtain the cert-manager config
  const certManagerConfigObj = await getCertManagerStackConfig(stackConfig);
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

  /* --------------------------------------------------------- */
  // Read the contents of the certificate and private key files
  const certificateContent = fs.readFileSync("cert.pem", "utf8");
  const privateKeyContent = fs.readFileSync("key.pem", "utf8");
  // Encode the contents as base64 strings
  const certificateBase64 = Buffer.from(certificateContent).toString("base64");
  const privateKeyBase64 = Buffer.from(privateKeyContent).toString("base64");
  // Define the self-signed certificate
  const tlsSecret = new k8s.core.v1.Secret("tls-secret", {
    metadata: {
      name: "tls-secret",
      namespace: infraStackRefObj.homeAssistantNamespace
    },
    type: "kubernetes.io/tls",
    data: {
      "tls.crt": certificateBase64,  // Base64-encoded certificate content
      "tls.key": privateKeyBase64
    },
  }, {dependsOn: certManager});
  // Define ClusterIssuer using self-signed certificate
  const clusterIssuer = new CustomResource("selfsigned-issuer", {
    apiVersion: "cert-manager.io/v1",
    kind: "ClusterIssuer",
    metadata: {
      name: "selfsigned-issuer",
      namespace: infraStackRefObj.homeAssistantNamespace,
    },
    spec: {
      selfSigned: {},
    },
  }, {dependsOn: tlsSecret});

  // Define Certificate resource using the ClusterIssuer
  const certificate = new CustomResource("example-tls", {
    apiVersion: "cert-manager.io/v1",
    kind: "Certificate",
    metadata: {
      name: "selfsigned-tls",
    },
    spec: {
      secretName: "tls-secret",
      commonName: "homeassistant.local",
      dnsNames: ["homeassistant.local","dev.homeassistant.local"],
      isCA: true,
      issuerRef: {
        name: clusterIssuer.metadata.name,
      },
    },
  });
  /* --------------------------------------------------------- */
  /*
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
      secretName: certManagerConfigObj.certSecretName,
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
  */

  // Return any stack output
  return {
    certSecretName: certManagerConfigObj.certSecretName,
    org: certManagerConfigObj.org,
    serverProject: certManagerConfigObj.serverProject,
    version: certManagerConfigObj.version
  }
}
// Export the custom values supplied to the helm chart
export const certManagerStackOutput = main();
