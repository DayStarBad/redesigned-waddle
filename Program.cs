using System;
using System.IO;
using System.Threading.Tasks;

namespace CodeKnowledgeGraphGenerator
{
    class Program
    {
        static async Task Main(string[] args)
        {
            try
            {
                if (args.Length < 1)
                {
                    Console.WriteLine("Usage: CodeKnowledgeGraphGenerator <path-to-solution-file> [output-directory]");
                    return;
                }

                var solutionPath = args[0];
                var outputDirectory = args.Length > 1 ? args[1] : "./output";

                if (!File.Exists(solutionPath))
                {
                    Console.WriteLine($"Error: Solution file not found at {solutionPath}");
                    return;
                }

                // Create output directory if it doesn't exist
                if (!Directory.Exists(outputDirectory))
                {
                    Directory.CreateDirectory(outputDirectory);
                }

                // Analyze the code
                Console.WriteLine("Starting code analysis...");
                var analyzer = new CodeAnalyzer(solutionPath);
                await analyzer.AnalyzeAsync();

                var entities = analyzer.GetEntities();
                var relationships = analyzer.GetRelationships();

                // Export data for visualization
                var jsonOutputPath = Path.Combine(outputDirectory, "graph-data.json");
                GraphExporter.ExportToD3Format(entities, relationships, jsonOutputPath);
                Console.WriteLine($"Graph data exported to {jsonOutputPath}");

                // Copy the HTML template
                var templatePath = "graph-template.html";
                var htmlOutputPath = Path.Combine(outputDirectory, "index.html");
                
                if (File.Exists(templatePath))
                {
                    File.Copy(templatePath, htmlOutputPath, true);
                    Console.WriteLine($"Visualization page created at {htmlOutputPath}");
                    Console.WriteLine($"Open this file in a web browser to view your code knowledge graph.");
                }
                else
                {
                    Console.WriteLine($"Warning: Template file not found at {templatePath}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
            }
        }
    }
}