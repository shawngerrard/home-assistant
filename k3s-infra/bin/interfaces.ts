import * as pulumi from "@pulumi/pulumi";


/* This file defines the interfacing types for object maps used throughout the project */
export interface iConnectionObj {
  host: string;
  port: number;
  user: string;
  privateKey: pulumi.Output<string>;
}
