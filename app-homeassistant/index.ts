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
  const nginxIngressService = k8s.core.v1.Service.get("nginx-ingress-nginx-controller", "home-assistant-dev/nginx-ingress-nginx-controller", { provider });
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
        "nginx.ingress.kubernetes.io/limit-rps": "10", // limit request per seconds multiplied by default burst-multiplier (5)
        "nginx.ingress.kubernetes.io/limit-connections": "10", // limit per ip
        "nginx.ingress.kubernetes.io/proxy-body-size": "30M", // limit request proxy body site to 30 megabytes
        "nginx.ingress.kubernetes.io/proxy-http-version": "1.1",
        "nginx.ingress.kubernetes.io/proxy-read-timeout": "86400",
        "nginx.ingress.kubernetes.io/rewrite-target": "/",
        "nginx.ingress.kubernetes.io/ssl-redirect": "true",
        "nginx.ingress.kubernetes.io/backend-protocol": "HTTP",
        "cert-manager.io/cluster-issuer": "letsencrypt-prod"
      },
      enabled: true,
      className: "nginx",
      hosts: [{
        host: "liveyourpassion.nz",
        paths: [{
          path: "/",
          pathType: "Prefix",
          backend: {
            service: {
              name: "home-assistant",
              port: {
                number: 8123
              }
            }
          }
        },
        {
          path: "/.well-known/acme-challenge",
          pathType: "Prefix",
          backend: {
            service: {
              name: "cert-manager",
              port: {
                number: 8089
              }
            }
          }
        }],
      },
      {
        host: "liveyourpassion.co.nz",
        paths: [{
          path: "/",
          pathType: "Prefix",
          backend: {
            service: {
              name: "home-assistant",
              port: {
                number: 8123
              }
            }
          }
        },
                {
          path: "/.well-known/acme-challenge",
          pathType: "Prefix",
          backend: {
            service: {
              name: "cert-manager",
              port: {
                number: 8089
              }
            }
          }
        }],
      }
              /*
      ,{
        host: "dev.liveyourpassion.nz",
        paths: [{
          path: "/",
          pathType: "Prefix"
        }],
      },
      {
        host: "dev.liveyourpassion.co.nz",
        paths: [{
          path: "/",
          pathType: "Prefix"
        }],
      }
      */
      ],
      tls: [{
        secretName: "homeassistant-dev-tls",
        hosts: ["liveyourpassion.nz","liveyourpassion.co.nz"]
      }]
    },
    service: {
      //type: "LoadBalancer",
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
  /*
  // Update home assistant configuration to trust nginx
  const updateConfig = new remote.Command("Update home assistant configuration", {
    create: "cd /mnt/data/home-assistant/ && sudo sed -zi '/http:/!s/$/\nhttp:\n\ \ use_x_forwarded_for\:\ true\n\ \ trusted_proxies\:\n\ \ \ \ - 10.42.0.0\/16/' configuration.yaml",
    connection: {
      host: infraConfigObj.serverIp,
      user: infraConfigObj.serverUser,
      port: infraConfigObj.serverPort,
      privateKey: config.require("serverKey")
    },
    delete: ""
  }, {
    dependsOn: appChart
  })
  // Update the home assistant deployment to initialize the new configuration
*/
  // Return the connection object for output (testing)
  //return customChartValues;
  // Return the ingress service endpoint ip for output (testing)
  return endpointIp
}
// Export the custom values supplied to the helm chart
export const homeAssistantStackOutput = main();
