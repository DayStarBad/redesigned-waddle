import { MCPManager } from './mcp/MCPManager';
import { SampleAgent } from './agents/SampleAgent';
import { AgentStatus } from './mcp/types';

console.log("Initializing AIdeator MCP Demo...");

// 1. Initialize MCPManager
const mcp = new MCPManager();

// 2. Create and register Sample Agents
try {
  const agentA = new SampleAgent("AgentA", "Worker", ["dataProcessing"], mcp);
  const agentB = new SampleAgent("AgentB", "Logger", ["logging", "echoing"], mcp);

  console.log("\n--- Agent Profiles ---");
  console.log(agentA.getProfile());
  console.log(agentB.getProfile());

  console.log("\n--- Message Exchange Demo ---");

  // Agent A sends a message to Agent B
  agentA.sendMessage(agentB.getId(), { task: "logData", data: "Sample data to log" });

  // Agent B checks for messages (and might process it)
  // In a real scenario, agents would have their own lifecycle/event loop
  console.log("\nAgent B checking messages:");
  agentB.checkMessages(); // Agent B receives and processes

  // Agent A sends an echo request to Agent B
  agentA.sendMessage(agentB.getId(), { action: "echo", content: "Hello Agent B!" });

  console.log("\nAgent B checking messages (for echo):");
  agentB.checkMessages(); // Agent B receives, processes, and sends an echo back

  console.log("\nAgent A checking messages (for echo response):");
  agentA.checkMessages(); // Agent A should receive the echo response

  // Demonstrate agent work cycle
  console.log("\n--- Agent Work Simulation ---");
  agentA.work();
  agentB.work();

  // Wait for work to complete to see logs
  setTimeout(() => {
     console.log("\n--- Final Agent Profiles ---");
     console.log(agentA.getProfile());
     console.log(agentB.getProfile());

     console.log("\n--- Registered Agents in MCP ---");
     mcp.listRegisteredAgents().forEach(agent => console.log(agent));

     console.log("\nAIdeator MCP Demo finished.");
  }, 5000); // Wait long enough for timeouts in work() and messages

} catch (error) {
  console.error("Error during MCP Demo setup:", error);
}
