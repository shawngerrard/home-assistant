import { remote } from "@pulumi/command";
import { iConnectionObj } from "../bin/interfaces";

// Async function to install k3s
export async function installK3s (connectionObj: iConnectionObj): Promise<remote.Command> {
  // Remote command to install K3S/Helm on the server
  const installKube = new remote.Command("Install K3S/Helm", {
    create: "curl -sfL https://get.k3s.io | sh -",
    connection: connectionObj,
    delete: "/usr/local/bin/k3s-uninstall.sh"
  }, {});

  return installKube;
}

// Async function to configure kubeconfig for cluster access
export async function configKubectl (connectionObj: iConnectionObj, dependency?: remote.Command): Promise<remote.Command> {
  // Remote command to configure kubeconfig on the server
  const kubeConfig = new remote.Command("Configure kubeconfig", {
    create: "mkdir ~/.kube && sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config",
    connection: connectionObj,
    delete: "rm -rf ~/.kube"
  }, {
    dependsOn: dependency
  });

  return kubeConfig;
}
