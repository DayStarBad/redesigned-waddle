import json
from datetime import datetime, timezone

# Read the existing collaboration state
file_path = "aideator-app/collaboration_state.json"
try:
    with open(file_path, 'r') as f:
        state = json.load(f)
except FileNotFoundError:
    print(f"Error: File {file_path} not found. Please ensure the collaboration state file exists.")
    exit(1)
except json.JSONDecodeError:
    print(f"Error: Could not decode JSON from {file_path}. Please check its format.")
    exit(1)

# New task details
new_task_id = "1.6" # Assuming this is the next logical task ID
new_task_description = "Implement MCP Agent-to-Agent Framework."
new_task_outputs = [
    "./aideator-app/src/mcp/types.ts",
    "./aideator-app/src/mcp/MCPManager.ts",
    "./aideator-app/src/agents/SampleAgent.ts",
    "./aideator-app/src/index.ts (updated)"
]

current_timestamp = datetime.now(timezone.utc).isoformat()

# Determine start time
# Using the previous task's end time if available and valid, otherwise current time.
previous_task_end_time = state['tasks'].get('1.5', {}).get('endTime')
start_time = previous_task_end_time if previous_task_end_time else current_timestamp


state['tasks'][new_task_id] = {
    "description": new_task_description,
    "status": "completed", # Marking as completed as per plan
    "assignedTo": "AI_Developer_01", # As per existing structure
    "dependencies": ["1.1"], # Depends on project initialization
    "priority": "high",
    "startTime": start_time,
    "endTime": current_timestamp,
    "outputs": new_task_outputs,
    "notes": "Successfully implemented the initial MCP (Multi-Agent Communication Protocol) framework including core manager, message types, and a sample agent integration. Jules (AI Agent) performed this task."
}

# Update general project state
state['lastUpdatedAt'] = current_timestamp
state['lastUpdatedBy'] = "AI_Developer_01"
# Optional: Add a note about AI contribution if not already in task notes
if "notes" not in state:
    state["notes"] = ""
state["notes"] += " Task 1.6 completed by AI Agent. "


# Write the updated state back to the file
try:
    with open(file_path, 'w') as f:
        json.dump(state, f, indent=2)
    print(f"Updated {file_path} with new task {new_task_id} for MCP Framework.")
except IOError:
    print(f"Error: Could not write to {file_path}.")
    exit(1)

# Verify the written content by reading it back (optional, for subtask verification)
try:
    with open(file_path, 'r') as f:
        updated_state_content = f.read()
        print("Verification - Content of updated file:")
        print(updated_state_content)
except FileNotFoundError:
    print(f"Error: Verification failed. File {file_path} not found after writing.")
except IOError:
    print(f"Error: Could not read {file_path} for verification.")
