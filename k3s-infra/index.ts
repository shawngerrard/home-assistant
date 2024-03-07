import * as pulumi from "@pulumi/pulumi";

export function pulumiConfig(): string {

    // Obtain pulumi configuration
    const config = new pulumi.Config();

    // Obtain secret ssh key from config
    const serverKey = config.requireSecret("serverKey");

    // Obtain server IP from config
    const serverIp = config.require("serverIp");

    // Output
    //console.log(`serverKey is ${serverKey} and serverIp is ${serverIp}`);

    //return `serverKey is ${serverKey} and serverIp is ${serverIp}
    return `serverIp is ${serverIp}`
}

pulumiConfig();
