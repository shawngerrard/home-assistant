import { remote } from "@pulumi/command";
import { iConnectionObj } from "../interfaces/connection";

// Async function to install k3s
export async function installK3s (connectionObj: iConnectionObj): Promise<remote.Command> {
  // Remote command to install k3s on the server
  const installKube = new remote.Command("Install K3S", {
    create: "curl -sfL https://get.k3s.io | sh -s - --disable=traefik",
    connection: connectionObj,
    delete: "/usr/local/bin/k3s-uninstall.sh"
  }, {});
  return installKube;
}

// Async function to copy kubeconfig for cluster access
export async function copyKubeConfig (connectionObj: iConnectionObj, dependency?: remote.Command): Promise<remote.Command> {
  // Remote command to configure kubeconfig on the server
  const kubeConfigFile = new remote.Command("Copy kube configuration", {
    create: "mkdir ~/.kube && sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config && sudo chown $(id -u):$(id -g) ~/.kube/config",
    connection: connectionObj,
    delete: "rm -rf ~/.kube"
  }, {
    dependsOn: dependency
  });
  return kubeConfigFile;
}

// Async function to set kubeconfig environment variables for cluster access
export async function setKubeConfigEnv (connectionObj: iConnectionObj, dependency?: remote.Command): Promise<remote.Command> {
  // Remote command to globally set a permanent environment variable on the server
  const kubeConfigEnv = new remote.Command("Set kubeconfig environment variable", {
    create: "echo KUBECONFIG=~/.kube/config | sudo tee -a /etc/environment && . /etc/environment",
    connection: connectionObj,
    delete: "sudo sed -i '/^KUBECONFIG/d' /etc/environment && unset KUBECONFIG"
  }, {
    dependsOn: dependency
  });
  return kubeConfigEnv;
}
