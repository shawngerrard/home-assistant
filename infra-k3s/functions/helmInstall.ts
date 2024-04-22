import { remote, local } from "@pulumi/command";
import { iConnectionObj } from "../../bin/interfaces/connection";

// Async function to install helm
export async function installHelm(connectionObj: iConnectionObj, dependency?: remote.Command | local.Command): Promise<remote.Command> {
  // Remote command to install helm on the server
  const installHelm = new remote.Command("Install Helm", {
    create: "curl -fsSL --create-dirs -o ~/downloads/helm/get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3" +
      " && chmod 700 ~/downloads/helm/get_helm.sh " +
      " && source ~/downloads/helm/get_helm.sh",
    connection: connectionObj,
    delete: "rm -rf ~/downloads/helm " +
      "&& rm -rf ~/.cache/helm " +
      "&& rm -rf ~/.config/helm " +
      "&& rm -rf ~/.local/share/helm " +
      "&& sudo rm -rf /usr/local/bin/helm"
  }, {
    dependsOn: dependency
  });
  return installHelm;
}
