import { Agent, Message, AgentStatus } from './types'; // Assuming types.ts is in the same directory

export class MCPManager {
  private agents: Map<string, Agent>;
  private messageQueue: Map<string, Message[]>; // Key is agentId

  constructor() {
    this.agents = new Map<string, Agent>();
    this.messageQueue = new Map<string, Message[]>();
    console.log("MCPManager initialized");
  }

  registerAgent(agent: Omit<Agent, 'status' | 'registeredAt' | 'lastSeenAt'>): Agent | null {
    if (this.agents.has(agent.id)) {
      console.warn(`Agent with ID ${agent.id} already registered.`);
      return this.agents.get(agent.id) || null;
    }
    const newAgent: Agent = {
      ...agent,
      status: AgentStatus.IDLE,
      registeredAt: new Date(),
      lastSeenAt: new Date(),
    };
    this.agents.set(newAgent.id, newAgent);
    this.messageQueue.set(newAgent.id, []); // Initialize message queue for the agent
    console.log(`Agent ${newAgent.id} registered successfully.`);
    return newAgent;
  }

  unregisterAgent(agentId: string): boolean {
    if (!this.agents.has(agentId)) {
      console.warn(`Agent with ID ${agentId} not found for unregistration.`);
      return false;
    }
    this.agents.delete(agentId);
    this.messageQueue.delete(agentId); // Remove message queue
    console.log(`Agent ${agentId} unregistered successfully.`);
    return true;
  }

  sendMessage(message: Message): boolean {
    const { receiverId, senderId } = message;

    if (!this.agents.has(senderId)) {
      console.error(`Sender agent ${senderId} not registered.`);
      return false;
    }
     if (!this.agents.has(receiverId)) {
      console.error(`Receiver agent ${receiverId} not registered.`);
      // Optionally, queue for later or handle as undeliverable
      return false;
    }

    const receiverQueue = this.messageQueue.get(receiverId);
    if (receiverQueue) {
      receiverQueue.push(message);
      // Update sender's lastSeenAt
      const sender = this.agents.get(senderId);
      if (sender) {
         this.agents.set(senderId, { ...sender, lastSeenAt: new Date() });
      }
      console.log(`Message from ${senderId} to ${receiverId} queued.`);
      return true;
    } else {
      // Should not happen if agent is registered
      console.error(`Message queue not found for receiver ${receiverId}. This indicates an inconsistency.`);
      return false;
    }
  }

  receiveMessage(agentId: string): Message | null {
    if (!this.agents.has(agentId)) {
      console.warn(`Agent ${agentId} not registered. Cannot receive messages.`);
      return null;
    }

    const queue = this.messageQueue.get(agentId);
    if (queue && queue.length > 0) {
      const message = queue.shift(); // FIFO
      if (message) {
         // Update receiver's lastSeenAt
         const receiver = this.agents.get(agentId);
         if (receiver) {
             this.agents.set(agentId, { ...receiver, lastSeenAt: new Date() });
         }
        console.log(`Agent ${agentId} received a message from ${message.senderId}.`);
        return message;
      }
    }
    // console.log(`No messages for agent ${agentId}.`);
    return null;
  }

  getAgent(agentId: string): Agent | null {
    return this.agents.get(agentId) || null;
  }

  updateAgentStatus(agentId: string, status: AgentStatus): boolean {
     const agent = this.agents.get(agentId);
     if (agent) {
         agent.status = status;
         agent.lastSeenAt = new Date();
         this.agents.set(agentId, agent);
         console.log(`Agent ${agentId} status updated to ${status}.`);
         return true;
     }
     console.warn(`Agent ${agentId} not found. Cannot update status.`);
     return false;
  }

  listRegisteredAgents(): Agent[] {
     return Array.from(this.agents.values());
  }
}
