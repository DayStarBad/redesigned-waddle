export interface Message {
  senderId: string;
  receiverId: string;
  payload: any; // Can be any serializable data
  timestamp: Date;
  messageId?: string; // Optional unique message identifier
  correlationId?: string; // Optional for message threading
  type?: string; // Optional message type for categorization
}

export enum AgentStatus {
  IDLE = 'idle',
  BUSY = 'busy',
  OFFLINE = 'offline',
  ERROR = 'error',
}

export interface Agent {
  id: string;
  role: string;
  status: AgentStatus;
  capabilities: string[]; // List of tasks the agent can perform
  registeredAt?: Date;
  lastSeenAt?: Date;
}
