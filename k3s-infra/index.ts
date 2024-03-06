import * as pulumi from "@pulumi/pulumi";

// Obtain pulumi configuration
const config = new pulumi.Config();

// Obtain secret ssh key from config
const serverKey = config.requireSecret("serverKey");

// Obtain server IP from config
const serverIp = config.requireSecret("serverIp");
