import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

async function main() {
    // Obtain the current project
    const projectId = pulumi.output(gcp.organizations.getProject({})).apply(project => project.projectId);
    // Create a new service account in gcp
    const serviceAccount = new gcp.serviceaccount.Account("home-assistant-service-account", {
        accountId: "ha-admin",
        displayName: "Home Assistant Admin",
    });
    // Grant roles to the service account
    const tokenCreatorRoleBinding = new gcp.projects.IAMBinding("service-account-token-creator-policy", {
        project: projectId,
        role: "roles/iam.serviceAccountTokenCreator",
        members: [serviceAccount.email],
    });
}
