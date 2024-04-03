import { getServerConnectionConfig } from "../bin/functions/connection";
import { copyNamespaceConfig,
         copyKubeConfig,
         installK3s,
         setKubeConfigFilepath,
         createNamespaces} from "./functions/k3sInstall";
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
  // Install helm on server
  const installHelmCli = await installHelm(connectionObj, kubeEnvVar);
  // Copy k3s namespace configuration files
  const copyNamespaceFile = await copyNamespaceConfig(connectionObj, installHelmCli);
  // Apply the namespace file to k3s
  const applyNamespaces = await createNamespaces(connectionObj, copyNamespaceFile);
  // Return connection configuration
  return {
    serverIp: connectionObj.host,
    serverPort: connectionObj.port,
    serverUser: connectionObj.user
  };
}

// Call main async function
export const connectionConfig = main();
