import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { iConnectionObj } from "../bin/interfaces/connection";

// Obtain the stack configuration
const config = new pulumi.Config("app-homeassistant");
// Obtain reference to the infra-k3s stack
const stackRef = new pulumi.StackReference(`${config.require("org")}/${config.require("serverStack")}/dev`);
// Obtain and output server stack references
export const conn = stackRef.getOutput('connectionConfig');
// Obtain server connection values from config and stack references
const connectionObj: iConnectionObj = {
  host: conn.apply(conn => {
    return conn.serverIp
  }),
  port: 22,
  user: conn.apply(conn => {
    return conn.serverUser
  }),
  privateKey: config.requireSecret("serverKey")
};
