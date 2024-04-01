import { remote } from "@pulumi/command";
import { iConnectionObj } from "../../bin/interfaces/connection";

// Async function to install k3s
export async function installK3s (connectionObj: iConnectionObj): Promise<remote.Command> {
  // Remote command to install k3s on the server
  const installKube = new remote.Command("Install K3S", {
    create: "curl -sfL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644 --disable=traefik --data-dir /mnt/data/k3s/",
    connection: connectionObj,
    delete: "/usr/local/bin/k3s-uninstall.sh"
  }, {});
  return installKube;
}

// Async function to copy kubeconfig for cluster access
export async function copyKubeConfig (connectionObj: iConnectionObj, dependency?: remote.Command): Promise<remote.Command> {
  // Remote command to configure kubeconfig on the server
  const kubeConfigFile = new remote.Command("Copy kube configuration", {
    create: "mkdir ~/.kube && mkdir ~/.kube/bin && sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config && sudo chown $(id -u):$(id -g) ~/.kube/config",
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

// Async function to copy initial k3s namespace configuration files to remote server
export async function copyNamespaceConfig(connectionObj: iConnectionObj, dependency?: remote.Command): Promise<remote.CopyFile> {
  // Copy local file to the remote server
  const copyConfigFiles = new remote.CopyFile("Copy cluster configuration files to server", {
    localPath: "./kube/namespaces.yaml",
    remotePath: "./.kube/bin/namespaces.yaml",
    connection: connectionObj
  }, {
    dependsOn: dependency
  });
  return copyConfigFiles;
}

// Async function to create cluster namespaces
export async function createNamespaces(connectionObj: iConnectionObj, dependency?: remote.CopyFile): Promise<remote.Command> {
  // Remote command to create namespaces in k3s
  const createNamespaces = new remote.Command("Create k3s namespaces", {
    create: "kubectl apply -f ~/.kube/bin/namespaces.yaml",
    connection: connectionObj,
    delete: "rm -rf ~/.kube/bin/namespaces.yaml"
  }, {
    dependsOn: dependency
  })
  return createNamespaces;
}
