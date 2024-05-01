import { getInfraStackConfig } from "../functions/infraConfig";
import { getCertManagerStackConfig } from "../functions/certManagerConfig"
import { iInfraStackConfig } from "../interfaces/config";
import * as pulumi from "@pulumi/pulumi";

var assert = require('assert');

// Testing mocha
/*
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1,2,3].indexOf(4), -1);
    });
  });
});
*/

// Custom mock implementation of pulumi.Config
class MockConfig implements pulumi.Config {
    private values: Record<string, string>;

    constructor(values: Record<string, string>) {
        this.values = values;
    }

    get(key: string): string | undefined {
        return this.values[key];
    }

    require(key: string): string {
        const value = this.get(key);
        if (value === undefined) {
            throw new Error(`Configuration value for key '${key}' is not set.`);
        }
        return value;
    }

    getBoolean(key: string): boolean | undefined {
        const value = this.get(key);
        return value !== undefined ? value.toLowerCase() === "true" : undefined;
    }

    getNumber(key: string): number | undefined {
        const value = this.get(key);
        return value !== undefined ? Number(value) : undefined;
    }
}

// Test infra-k3s functions and resources
describe("Testing 'infra-k3s'", function() {
  // Test getServerConnectionConfig
  describe("Testing 'getServerConnectionConfig'", function() {
    // Mock pulumi infra configuration object
    before(async function() {
      // Create the mock pulumi.Config object
      pulumi.runtime.setConfig("serverIp", "exampleHost");
      pulumi.runtime.setConfig("serverUser", "exampleUser");
      //pulumi.runtime.setSecret("serverKey", "exampleKey");
      //pulumi.secret()
      pulumi.runtime.setMocks({
        serverIp: "exampleHost"
      });
    });
  });
});


// Testing bin/functions
describe("Global Functions", function() {
  // Test getStackReferences function
  describe("infraConfig.getInfraStackReferences", function() {
    // Declare an empty object
    let testStackRef: iInfraStackConfig;
    // Set the runtime config and mocks
    before(async function(){
      // Mock the config
      pulumi.runtime.setConfig("project:org", "myhome");
      pulumi.runtime.setConfig("project:serverProject", "infra-k3s");
      const config = new pulumi.Config();
      pulumi.log.info(config.require("homeAssistantNamespace"));
      testStackRef = await getInfraStackConfig(pulumi.runtime.getConfig("serverProject") as string, config);
      //testStackRef = await getInfraStackConfig(pulumi.runtime.getConfig("serverProject") as string, pulumi.runtime.allConfig());
    });
      it("Should return 'home-assistant-dev' if the value is present", async function() {
      assert.ok(testStackRef, "testStackRef is not defined");
      assert.equal(testStackRef.homeAssistantNamespace, "home-assistant-dev");
    });
  });
/*
  // Test getCertManagerStackConfig function
  describe("certManagerConfig.getCertManagerStackConfig", function() {
    // Set type to test object
    type testStackType = {
      version: string | pulumi.Output<any>,
      certManagerProject: string | pulumi.Output<any>
    };
    // Define variable of test type above
    let testCertManagerConfig: testStackType;
    // Set the runtime config and stack references
    before(async function(){
      pulumi.runtime.setConfig("project:org", "myhome");
      pulumi.runtime.setConfig("project:certManagerProject", "app-certmanager");
      pulumi.runtime.setConfig("project:serverProject", "infra-k3s");
      pulumi.runtime.setConfig("infra-k3s:homeAssistantNamespace", "home-assistant-dev");
      pulumi.runtime.setConfig("project:version", "1.14.5");
      testCertManagerConfig = await getCertManagerStackConfig();
    });
    it("Should return '1.14.5' if the value is present", async function() {
      assert.ok(testCertManagerConfig, "testCertManagerConfig object is not defined");
      assert.ok(testCertManagerConfig, "'version' from config is not defined");
      assert.equal(testCertManagerConfig.version, "1.14.5");
    });
  });
*/
});
