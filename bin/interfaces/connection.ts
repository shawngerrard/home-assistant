import * as pulumi from "../../node_modules/@pulumi/pulumi";


/* This file defines the interfacing types for object maps used throughout the project */
export interface iConnectionObj {
  host: string;
  port: number;
  user: string;
  privateKey: pulumi.Output<string>;
}
