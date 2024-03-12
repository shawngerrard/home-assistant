import * as pulumi from "@pulumi/pulumi";

// Obtain pulumi configuration
const config = new pulumi.Config("k3s-infra");

// Export secret ssh key from config to output
export const serverKey = config.requireSecret("serverKey");

// Export server IP from config to output
export const serverIp = config.require("serverIp");

// Log config
//console.log(`serverKey is ${serverKey} and serverIp is ${serverIp}`);
console.log(config);
