import { MCPManager } from './MCPManager';
import { Agent, Message, AgentStatus } from './types';

describe('MCPManager', () => {
  let mcpManager: MCPManager;
  const agentDetails1 = { id: 'agent1', role: 'testRole1', capabilities: ['test1'] };
  const agentDetails2 = { id: 'agent2', role: 'testRole2', capabilities: ['test2'] };

  // Test console.log and console.warn spy
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spies should be set up before MCPManager instantiation if constructor logs
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mcpManager = new MCPManager();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Agent Registration', () => {
    it('should register a new agent successfully', () => {
      const agent = mcpManager.registerAgent(agentDetails1);
      expect(agent).not.toBeNull();
      expect(agent?.id).toBe(agentDetails1.id);
      expect(agent?.status).toBe(AgentStatus.IDLE);
      expect(mcpManager.getAgent(agentDetails1.id)).toEqual(agent);
      expect(mcpManager.listRegisteredAgents()).toHaveLength(1);
    });

    it('should return the existing agent if trying to register with the same ID', () => {
      mcpManager.registerAgent(agentDetails1);
      const agent = mcpManager.registerAgent(agentDetails1);
      expect(agent?.id).toBe(agentDetails1.id);
      expect(mcpManager.listRegisteredAgents()).toHaveLength(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(`Agent with ID ${agentDetails1.id} already registered.`);
    });
  });

  describe('Agent Unregistration', () => {
    it('should unregister an existing agent', () => {
      mcpManager.registerAgent(agentDetails1);
      const result = mcpManager.unregisterAgent(agentDetails1.id);
      expect(result).toBe(true);
      expect(mcpManager.getAgent(agentDetails1.id)).toBeNull();
      expect(mcpManager.listRegisteredAgents()).toHaveLength(0);
    });

    it('should return false if trying to unregister a non-existent agent', () => {
      const result = mcpManager.unregisterAgent('nonExistentAgent');
      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Agent with ID nonExistentAgent not found for unregistration.');
    });
  });

  describe('Message Sending and Receiving', () => {
    let agent1: Agent;
    let agent2: Agent;

    beforeEach(() => {
      // Non-null assertion operator used as we expect registration to succeed
      agent1 = mcpManager.registerAgent(agentDetails1)!;
      agent2 = mcpManager.registerAgent(agentDetails2)!;
    });

    it('should send a message to a registered agent successfully', () => {
      const message: Message = {
        senderId: agent1.id,
        receiverId: agent2.id,
        payload: { data: 'hello' },
        timestamp: new Date(),
      };
      const result = mcpManager.sendMessage(message);
      expect(result).toBe(true);
    });

    it('should allow an agent to receive a message sent to it', () => {
      const payload = { data: 'hello agent2' };
      const message: Message = {
        senderId: agent1.id,
        receiverId: agent2.id,
        payload,
        timestamp: new Date(),
      };
      mcpManager.sendMessage(message);
      const receivedMessage = mcpManager.receiveMessage(agent2.id);
      expect(receivedMessage).not.toBeNull();
      expect(receivedMessage?.payload).toEqual(payload);
      expect(receivedMessage?.senderId).toBe(agent1.id);
    });

    it('should return null if an agent tries to receive a message but has none', () => {
      const receivedMessage = mcpManager.receiveMessage(agent1.id);
      expect(receivedMessage).toBeNull();
    });

    it('should queue messages in FIFO order', () => {
      const message1: Message = { senderId: agent1.id, receiverId: agent2.id, payload: {msg: 1}, timestamp: new Date() };
      const message2: Message = { senderId: agent1.id, receiverId: agent2.id, payload: {msg: 2}, timestamp: new Date() };
      mcpManager.sendMessage(message1);
      mcpManager.sendMessage(message2);

      const received1 = mcpManager.receiveMessage(agent2.id);
      expect(received1?.payload).toEqual({msg: 1});
      const received2 = mcpManager.receiveMessage(agent2.id);
      expect(received2?.payload).toEqual({msg: 2});
    });

    it('should fail to send a message if sender is not registered', () => {
      const message: Message = {
        senderId: 'nonExistentSender',
        receiverId: agent2.id,
        payload: { data: 'hello' },
        timestamp: new Date(),
      };
      const result = mcpManager.sendMessage(message);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Sender agent nonExistentSender not registered.');
    });

    it('should fail to send a message if receiver is not registered', () => {
      const message: Message = {
        senderId: agent1.id,
        receiverId: 'nonExistentReceiver',
        payload: { data: 'hello' },
        timestamp: new Date(),
      };
      const result = mcpManager.sendMessage(message);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Receiver agent nonExistentReceiver not registered.');
    });
     it('should return null when trying to receive messages for an unregistered agent', () => {
      const receivedMessage = mcpManager.receiveMessage('unregisteredAgent');
      expect(receivedMessage).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Agent unregisteredAgent not registered. Cannot receive messages.');
    });
  });

  describe('Agent Status Management', () => {
    it('should update the status of a registered agent', () => {
      mcpManager.registerAgent(agentDetails1); // agent is registered, then status updated.
      const result = mcpManager.updateAgentStatus(agentDetails1.id, AgentStatus.BUSY);
      expect(result).toBe(true);
      const agent = mcpManager.getAgent(agentDetails1.id);
      expect(agent?.status).toBe(AgentStatus.BUSY);
    });

    it('should not update status for a non-existent agent and return false', () => {
      const result = mcpManager.updateAgentStatus('nonExistentAgent', AgentStatus.BUSY);
      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Agent nonExistentAgent not found. Cannot update status.');
    });
  });

  describe('List Registered Agents', () => {
    it('should return an empty array if no agents are registered', () => {
      expect(mcpManager.listRegisteredAgents()).toEqual([]);
    });

    it('should return an array of all registered agents', () => {
      const registeredAgent1 = mcpManager.registerAgent(agentDetails1);
      const registeredAgent2 = mcpManager.registerAgent(agentDetails2);
      const agentList = mcpManager.listRegisteredAgents();
      expect(agentList).toHaveLength(2);
      expect(agentList).toContainEqual(registeredAgent1);
      expect(agentList).toContainEqual(registeredAgent2);
    });
  });
});
