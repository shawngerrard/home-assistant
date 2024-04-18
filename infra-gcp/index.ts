import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

async function main() {
    // Obtain the current project
    const projectId = pulumi.output(gcp.organizations.getProject({})).apply(project => { return project.projectId });

    // Create a new service account in gcp
    const serviceAccount = new gcp.serviceaccount.Account("home-assistant-service-account", {
        accountId: "ha-admin-service-account",
        displayName: "Home Assistant Admin",
    });
    // Grant roles to the service account
    const tokenCreatorRoleBinding = new gcp.projects.IAMBinding("service-account-token-creator-policy", {
        project: projectId.apply(projectId => projectId || ""),
        role: "roles/iam.serviceAccountTokenCreator",
        members: [serviceAccount.member],
    },{
        dependsOn: serviceAccount
    });
    // TODO: Implement key rotation
    // TODO: Implement hashicorp vault into infra-k3s to manage keys/rotation
    // Create a key for the service account
    const serviceAccountKey = new gcp.serviceaccount.Key("ha-admin-service-account-key",{
        serviceAccountId: serviceAccount.name,
        publicKeyType: "TYPE_X509_PEM_FILE"
    });
    // Return output
    return {
        serviceAccountId: serviceAccount.accountId,
        serviceAccountRoles: tokenCreatorRoleBinding.role,
        serviceAccountKeyName: serviceAccountKey.name
    }
}
// Invoke main and output logs
export const serviceAccountDetails = main();
