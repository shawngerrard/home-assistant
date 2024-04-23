import { Output } from "@pulumi/pulumi";
import { remote, local } from "@pulumi/command";
import { PersistentVolume } from "@pulumi/kubernetes/core/v1";
import { StorageClass } from "@pulumi/kubernetes/storage/v1";

// Async function to create a storage class in the cluster
export async function createStorageClass(dependency?: remote.Command | local.Command): Promise<StorageClass> {
  const createSc = new StorageClass("Apply ssd storage class", {
    metadata: {
      name: "sc-ssd-homepi-homeassistant"
    },
    reclaimPolicy: "Retain",
    provisioner: "kubernetes.io/no-provisioner",
    volumeBindingMode: "WaitForFirstConsumer",
  }, {
    dependsOn: dependency
  })
  return createSc;
}

// Async function to create a persistent volume in the cluster
export async function createPersistentVolume (storageClassName: Output<string>, dependency?: remote.Command | local.Command | StorageClass): Promise<PersistentVolume> {
  // Definition of persistent volume
  const createPv = new PersistentVolume("Apply persistent volume", {
    metadata: {
      name: "pv-ssd-homepi-homeassistant",
      namespace: "app-homeassistant-dev"
    },
    spec: {
      capacity: {
        storage: "500Gi"
      },
      volumeMode: "Filesystem",
      accessModes: ["ReadWriteOnce"],
      persistentVolumeReclaimPolicy: "Retain",
      storageClassName: storageClassName,
      hostPath: {
        path: "/mnt/data/home-assistant"
      }
    }
  }, {
    dependsOn: dependency
  });
  return createPv;
}
