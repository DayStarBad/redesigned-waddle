import { MCPManager } from '../mcp/MCPManager';
import { Agent, Message, AgentStatus } from '../mcp/types';

export class SampleAgent {
  private agentProfile: Agent;
  private mcpManager: MCPManager;

  constructor(id: string, role: string, capabilities: string[], mcpManager: MCPManager) {
    this.mcpManager = mcpManager;
    const registeredAgent = this.mcpManager.registerAgent({ id, role, capabilities });
    if (!registeredAgent) {
      throw new Error(`Agent ${id} could not be registered with MCPManager.`);
    }
    this.agentProfile = registeredAgent;
    console.log(`SampleAgent ${this.agentProfile.id} created and registered.`);
  }

  public getId(): string {
    return this.agentProfile.id;
  }

  public sendMessage(receiverId: string, payload: any, type?: string): boolean {
    const message: Message = {
      senderId: this.agentProfile.id,
      receiverId,
      payload,
      timestamp: new Date(),
      type: type || 'generic',
    };
    console.log(`Agent ${this.getId()} sending message to ${receiverId}`);
    return this.mcpManager.sendMessage(message);
  }

  public checkMessages(): Message | null {
    // console.log(`Agent ${this.getId()} checking for messages.`);
    const message = this.mcpManager.receiveMessage(this.agentProfile.id);
    if (message) {
      console.log(`Agent ${this.getId()} received message:`, message);
      this.processMessage(message);
    }
    return message;
  }

  private processMessage(message: Message): void {
    console.log(`Agent ${this.getId()} processing message from ${message.senderId}:`, message.payload);
    // Example processing: simple echo back for a certain type
    if (message.payload.action === 'echo') {
      this.sendMessage(message.senderId, { originalPayload: message.payload, response: `Echo from ${this.getId()}` }, 'echoResponse');
    }
  }

  public updateStatus(status: AgentStatus): void {
    this.mcpManager.updateAgentStatus(this.agentProfile.id, status);
    this.agentProfile.status = status; // Keep local profile in sync
  }

  public getProfile(): Agent {
     return { ...this.agentProfile, status: this.mcpManager.getAgent(this.agentProfile.id)?.status || this.agentProfile.status };
  }

  public work(): void {
     // Simulate agent doing work and checking messages periodically
     this.updateStatus(AgentStatus.BUSY);
     console.log(`Agent ${this.getId()} is doing some work...`);
     // Simulate work
     setTimeout(() => {
         this.checkMessages();
         this.updateStatus(AgentStatus.IDLE);
         console.log(`Agent ${this.getId()} finished work and is now idle.`);
     }, 2000);
  }
}
