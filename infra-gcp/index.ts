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
    // Return output
    return {
        serviceAccountId: serviceAccount.accountId,
        serviceAccountRoles: tokenCreatorRoleBinding.role
    }
}
export const serviceAccountDetails = main();
