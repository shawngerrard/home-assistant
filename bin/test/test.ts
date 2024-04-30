import { getStackReferences } from "../functions/infraConfig";
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
// Testing bin/functions
describe("Global Functions", function() {
  // Testing getStackReferences
  describe("infraConfig.getStackReferences", function() {
    // Declare an empty object
    let testStackRef: iInfraStackConfig<string>;
    // Set the config and stack references
    before(async function(){
      pulumi.runtime.setConfig("project:org", "myhome");
      pulumi.runtime.setConfig("infra-k3s:homeAssistantNamespace", "home-assistant-dev")
      testStackRef = await getStackReferences("infra-k3s");
    });
    it("Should return 'home-assistant-dev' if the value is present", async function() {
      //console.log(testStackRef.homeAssistantNamespace.apply(name => { return name }));
      assert.ok(testStackRef, "testStackRef is not defined");
      assert.equal(testStackRef.homeAssistantNamespace, "home-assistant-dev");
    });
  });
});
