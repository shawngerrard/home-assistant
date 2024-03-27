import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { iConnectionObj } from "../bin/interfaces/connection";


const stackRef = new pulumi.StackReference('myhome/infra-k3s/dev');
export const conn = stackRef.getOutput('connectionConfig');
export const serverIp = conn.apply(conn => {return conn.serverIp});
export const stackOutput = pulumi.all([conn]).apply(([ip,port,user]) => {
  return {
    serverIp: ip,
    serverPort: port,
    serverUser: user
  }
});
