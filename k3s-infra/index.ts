import * as pulumi from "@pulumi/pulumi";

export function pulumiConfig() {

    // Obtain pulumi configuration
    const config = new pulumi.Config();

    // Obtain secret ssh key from config
    const serverKey = config.requireSecret("serverKey");

    // Obtain server IP from config
    const serverIp = config.requireSecret("serverIp");

    // Output
    console.log(`serverKey is ${serverKey} and serverIp is ${serverIp}`);
}
