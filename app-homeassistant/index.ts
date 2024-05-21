/*
 * This stack depends on the deployment of the "infra-k3s" stack.
 *
 * Please ensure the "infra-k3s" stack is UP before deploying this stack.
*/
import * as k8s from "@pulumi/kubernetes";
import { all, concat, Config, getProject, getStack, output } from "@pulumi/pulumi";
import { getInfraStackConfigFromStackOutput } from "../bin/functions/infraConfig";

async function main() {
  // Obtain the stack config
  const config = new Config(getProject());
  // Obtain the infra-k3s stack configuration
  const infraConfigObj = await getInfraStackConfigFromStackOutput(config);
  // Define a kubernetes provider for the cluster
  const provider = new k8s.Provider("provider", {
    //kubeconfig: output(kubeConfig).apply(JSON.stringify),
    kubeconfig: output(infraConfigObj.kubeConfigPath).apply(path => path)
  });
  // Obtain the nginx-ingress service
  const nginxIngressService = k8s.core.v1.Service.get("nginx-nginx-ingress-controller", "home-assistant-dev/nginx-nginx-ingress-controller", { provider });
  // Get the list of endpoint ip's for the service
  const endpointList = all([nginxIngressService.metadata.name, concat(nginxIngressService.metadata.namespace, "/", nginxIngressService.metadata.name)]).apply(([name, namespace]) =>
    k8s.core.v1.Endpoints.get(name, namespace, { provider }));
  // Get the endpoint ip if endpoints are defined
  const endpointIp = endpointList.apply(endpoints => {
    if (endpoints && endpoints.subsets && endpoints.subsets[0] && endpoints.subsets[0].addresses && endpoints.subsets[0].addresses[0]) {
      return endpoints.subsets[0].addresses[0].ip;
    }
    return undefined;
  });
  // Set the path for the local chart
  const chartPath = "./../../helm-charts/charts/home-assistant";
  // Specify custom template settings for service in Helm values file
  const customChartValues = {
    ingress: {
      annotations: {
        "nginx.ingress.kubernetes.io/limit-rps": "5", // limit request per seconds multiplied by default burst-multiplier (5)
        "nginx.ingress.kubernetes.io/limit-connections": "2", // limit per ip
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
      port: 8123
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
  //return customChartValues;
  // Return the ingress service endpoint ip for output (testing)
  return endpointIp
}
// Export the custom values supplied to the helm chart
export const homeAssistantStackOutput = main();
