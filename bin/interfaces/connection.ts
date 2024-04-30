import * as pulumi from "../../node_modules/@pulumi/pulumi";

/* This file defines the interfacing types for object maps used throughout the project */
export interface iConnectionObj {
  host: string | pulumi.Output<any>,
  port: number | pulumi.Output<any>,
  user: string | pulumi.Output<any>,
  privateKey: pulumi.Output<string>;
}
