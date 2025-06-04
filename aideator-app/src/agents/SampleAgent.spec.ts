import { SampleAgent } from './SampleAgent';
import { MCPManager } from '../mcp/MCPManager';
import { AgentStatus, Message } from '../mcp/types';

describe('SampleAgent', () => {
  let mcpManager: MCPManager;
  let agentA: SampleAgent;
  let agentB: SampleAgent;

  // Spy on console methods
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spies must be active when MCPManager constructor is called if it logs
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    mcpManager = new MCPManager();
    agentA = new SampleAgent('agentA', 'Worker', ['work'], mcpManager);
    agentB = new SampleAgent('agentB', 'Echoer', ['echo'], mcpManager);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('should create and register itself with MCPManager upon construction', () => {
    expect(agentA.getId()).toBe('agentA');
    expect(mcpManager.getAgent('agentA')).not.toBeNull();
    expect(mcpManager.getAgent('agentA')?.role).toBe('Worker');
  });

  it('should throw an error if agent registration fails in constructor', () => {
    // Make registerAgent return null to simulate failure
    jest.spyOn(mcpManager, 'registerAgent').mockReturnValueOnce(null);
    expect(() => new SampleAgent('agentC', 'Test', [], mcpManager))
      .toThrow('Agent agentC could not be registered with MCPManager.');
  });

  it('should send a message via MCPManager', () => {
    const sendMessageSpy = jest.spyOn(mcpManager, 'sendMessage');
    const payload = { task: 'doSomething' };
    agentA.sendMessage(agentB.getId(), payload, 'taskMessage');

    expect(sendMessageSpy).toHaveBeenCalledWith(expect.objectContaining({
      senderId: agentA.getId(),
      receiverId: agentB.getId(),
      payload: payload,
      type: 'taskMessage',
    }));
  });

  it('should receive and process a message from MCPManager', () => {
    const payload = { instruction: 'processThis' };
    // Directly use mcpManager to send a message to agentA for testing receive
    const directMessage: Message = {
        senderId: agentB.getId(),
        receiverId: agentA.getId(),
        payload: payload,
        timestamp: new Date(),
        type: 'direct'
    };
    mcpManager.sendMessage(directMessage);

    const receivedMessage = agentA.checkMessages();
    expect(receivedMessage).not.toBeNull();
    expect(receivedMessage?.payload).toEqual(payload);
  });

  it('should return null when checking messages and none are available', () => {
    const message = agentA.checkMessages();
    expect(message).toBeNull();
  });

  it('should respond to an echo message', () => {
    const echoPayload = { action: 'echo', data: 'Hello there!' };
    const mcpSendMessageSpy = jest.spyOn(mcpManager, 'sendMessage');

    // Agent A sends echo request to Agent B
    agentA.sendMessage(agentB.getId(), echoPayload, 'echoRequest');

    // Agent B checks messages, should process and send echo back
    agentB.checkMessages();

    // Check if agentB sent a message back to agentA
    expect(mcpSendMessageSpy).toHaveBeenCalledWith(expect.objectContaining({
      senderId: agentB.getId(),
      receiverId: agentA.getId(),
      payload: { originalPayload: echoPayload, response: `Echo from ${agentB.getId()}` },
      type: 'echoResponse',
    }));
  });

  it('should update its status via MCPManager', () => {
    const updateStatusSpy = jest.spyOn(mcpManager, 'updateAgentStatus');
    agentA.updateStatus(AgentStatus.BUSY);
    expect(updateStatusSpy).toHaveBeenCalledWith(agentA.getId(), AgentStatus.BUSY);
    expect(agentA.getProfile().status).toBe(AgentStatus.BUSY);
  });

  it('getProfile should reflect the status from MCPManager', () => {
    // Manually update status in MCPManager to simulate external change
    mcpManager.updateAgentStatus(agentA.getId(), AgentStatus.ERROR);
    const profile = agentA.getProfile();
    expect(profile.status).toBe(AgentStatus.ERROR);
  });

  describe('work method', () => {
    jest.useFakeTimers(); // Use Jest's fake timers

    it('should set status to BUSY, check messages after a delay, then set to IDLE', () => {
      const updateStatusSpy = jest.spyOn(mcpManager, 'updateAgentStatus');
      const checkMessagesSpy = jest.spyOn(agentA, 'checkMessages');

      agentA.work();

      expect(updateStatusSpy).toHaveBeenCalledWith(agentA.getId(), AgentStatus.BUSY);

      // Fast-forward time
      jest.runAllTimers();

      expect(checkMessagesSpy).toHaveBeenCalled();
      expect(updateStatusSpy).toHaveBeenCalledWith(agentA.getId(), AgentStatus.IDLE);

      jest.useRealTimers(); // Restore real timers
    });
  });
});
