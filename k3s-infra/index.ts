import * as pulumi from "@pulumi/pulumi";
import { remote } from "@pulumi/command";
import { iConnectionObj } from "./bin/interfaces";

// Obtain pulumi configuration
const config = new pulumi.Config("k3s-infra");

// TODO 1a: Set wan server port and lan server port in pulumi config
// TODO 1b: Test for network gateway host/ip to determine port to use
// TODO 1c: Use port variable in connectionObj below
// TODO 2a: Abstract connectionObj into its own module

// Create connection object using the type interface
const connectionObj = {
  host: config.require("serverIp"),
  port: 22,
  user: config.require("serverUser"),
  privateKey: config.requireSecret("serverKey")
} as iConnectionObj;

// Log config
console.log(config);

// Install K3S on the server
const installK3S = new remote.Command("Install K3S", {
  create: "curl -sfL https://get.k3s.io | sh -",
  connection: connectionObj,
  delete: "/usr/local/bin/k3s-uninstall.sh"
}, {});
