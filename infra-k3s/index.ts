import { getServerConnectionConfig } from "../bin/functions/connection";
import { createNamespace,
         copyKubeConfig,
         installK3s,
         setKubeConfigFilepath,
         getLocalKubeConfig
       } from "./functions/k3sInstall";
import { createPersistentVolume, createStorageClass } from "./functions/k3sVolumes"
import { installHelm } from "./functions/helmInstall";

async function main() {
  // Create connection object using the type interface
  const connectionObj = await getServerConnectionConfig();
  // Log config
  //console.log(config);
  // Install k3s on server
  const installKube = await installK3s(connectionObj);
  // Configure cluster access on server
  const kubeConfig = await copyKubeConfig(connectionObj, installKube);
  // Create kubeconfig environment variable
  const kubeEnvVar = await setKubeConfigFilepath(connectionObj, kubeConfig);
  // Configure local cluster access
  const localKubeConfig = await getLocalKubeConfig(connectionObj, kubeEnvVar);
  // Create a home-assistant namespace in the new cluster
  const homeAssistantNamespace = await createNamespace("home-assistant", localKubeConfig);
  // Create storage class for the cluster
  const storageClass = await createStorageClass(localKubeConfig);
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
    serverVolumeStorageClass: persistentVolume.spec.storageClassName,
    serverVolumeMountPath: persistentVolume.spec.hostPath.path,
    homeAssistantNamespace: homeAssistantNamespace.metadata.name
  };
}

// Call main async function
export const infraConfig = main();
