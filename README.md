# Code Knowledge Graph Generator for ASP.NET Core

This tool analyzes ASP.NET Core C# codebases and generates interactive knowledge graph visualizations to help developers understand code structure and relationships.

## Features

- Analyzes ASP.NET Core solutions using Roslyn
- Identifies classes, interfaces, controllers, services, repositories, etc.
- Detects inheritance, implementation, and dependency relationships
- Generates interactive D3.js-based visualizations
- Interactive features: zoom, pan, drag, tooltips, force controls

## Requirements

- .NET Core 6.0 or higher
- A web browser with JavaScript enabled

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/code-knowledge-graph.git
cd code-knowledge-graph

# Build the project
dotnet build
```

## Usage

```bash
# Run the tool on your solution
dotnet run <path-to-your-solution.sln> [output-directory]
```

If no output directory is specified, the results will be saved in a folder named "output" in the current directory.

Once the analysis is complete, open the `index.html` file in the output directory using a web browser to view the visualization.

## Sample Visualization

A sample visualization is included in the `output` directory. Open `output/index.html` to see it in action.

## Understanding the Visualization

Nodes in the visualization represent code entities with different colors:

- **Orange**: Controllers
- **Green**: Services
- **Blue**: Repositories
- **Purple**: Interfaces
- **Yellow**: Models
- **Gray**: Other classes

Lines between nodes represent relationships:

- **Orange lines**: Inheritance relationships
- **Green lines**: Interface implementations
- **Gray lines**: Dependencies (via DI or direct usage)

## Controls

- **Zoom**: Use the mouse wheel to zoom in and out
- **Pan**: Click and drag on the background to pan around
- **Move nodes**: Click and drag nodes to rearrange the layout
- **Force Strength**: Adjust the strength of node repulsion
- **Link Distance**: Adjust the length of relationship lines
- **Reset Zoom**: Reset the view to fit the entire graph
- **Expand All**: Increase node spacing for better visibility

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.