import { getServerConnectionConfig } from "../bin/functions/connection";
import { createNamespace,
         copyKubeConfig,
         installK3s,
         setKubeConfigFilepath,
         getLocalKubeConfig
       } from "./functions/k3sInstall";
import { createPersistentVolume, createStorageClass } from "./functions/k3sVolumes"
import { installHelm } from "./functions/helmInstall";
import * as pulumi from "@pulumi/pulumi";

async function main() {
  // Get pulumi stack config
  const config = new pulumi.Config(pulumi.getProject());
  // Create connection object
  const connectionObj = await getServerConnectionConfig();
  // Install k3s on server
  const installKube = await installK3s(connectionObj);
  // Configure cluster access on server
  const kubeConfig = await copyKubeConfig(connectionObj, installKube);
  // Create kubeconfig environment variable
  const kubeEnvVar = await setKubeConfigFilepath(connectionObj, config.require("kubeConfigPath"), kubeConfig);
  // Configure local cluster access
  const localKubeConfig = await getLocalKubeConfig(connectionObj, kubeEnvVar);
  // Create a home-assistant namespace in the new cluster
  const homeAssistantNamespace = await createNamespace("home-assistant", localKubeConfig);
  // Create storage class for the cluster
  const storageClass = await createStorageClass(homeAssistantNamespace);
  // Create persistent volume for the storage class
  const persistentVolume = await createPersistentVolume(homeAssistantNamespace.metadata.name,
                                                        storageClass.metadata.name,
                                                        storageClass);
  // Install helm on server
  const installHelmCli = await installHelm(connectionObj, persistentVolume);
  // Return connection configuration
  return {
    serverIp: connectionObj.host,
    serverPort: connectionObj.port,
    serverUser: connectionObj.user,
    adminEmail: config.require("adminEmail"),
    serverVolumeStorageClass: persistentVolume.spec.storageClassName,
    serverVolumeMountPath: persistentVolume.spec.hostPath.path,
    homeAssistantNamespace: homeAssistantNamespace.metadata.name,
    kubeConfigPath: config.require("kubeConfigPath")
  };
}

// Call main async function
export const infraStackOutput = main();
