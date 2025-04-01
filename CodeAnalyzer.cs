using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Build.Locator;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.MSBuild;

namespace CodeKnowledgeGraphGenerator
{
    public class CodeAnalyzer
    {
        private readonly string _solutionPath;
        private Dictionary<string, CodeEntity> _entities = new Dictionary<string, CodeEntity>();
        private List<CodeRelationship> _relationships = new List<CodeRelationship>();

        static CodeAnalyzer()
        {
            MSBuildLocator.RegisterDefaults();
        }

        public CodeAnalyzer(string solutionPath)
        {
            _solutionPath = solutionPath;
        }

        public async Task AnalyzeAsync()
        {
            using var workspace = MSBuildWorkspace.Create();

            // Progress tracking
            workspace.WorkspaceFailed += (s, e) =>
                Console.WriteLine($"Workspace error: {e.Diagnostic.Message}");

            Console.WriteLine($"Loading solution: {_solutionPath}");
            var solution = await workspace.OpenSolutionAsync(_solutionPath);
            Console.WriteLine("Solution loaded successfully.");

            foreach (var project in solution.Projects)
            {
                // Skip test projects
                if (project.Name.Contains("Test") || project.Name.Contains("Tests"))
                    continue;

                Console.WriteLine($"Analyzing project: {project.Name}");
                var compilation = await project.GetCompilationAsync();

                if (compilation == null)
                {
                    Console.WriteLine($"Failed to get compilation for {project.Name}");
                    continue;
                }

                foreach (var document in project.Documents)
                {
                    var syntaxTree = await document.GetSyntaxTreeAsync();
                    if (syntaxTree == null)
                        continue;

                    var semanticModel = compilation.GetSemanticModel(syntaxTree);
                    var root = await syntaxTree.GetRootAsync();

                    // Extract classes, interfaces, etc.
                    ExtractEntities(root, semanticModel, project.Name);

                    // Extract relationships
                    ExtractRelationships(root, semanticModel, project.Name);
                }
            }

            Console.WriteLine(
                $"Analysis complete. Found {_entities.Count} entities and {_relationships.Count} relationships."
            );
        }

        private void ExtractEntities(
            SyntaxNode root,
            SemanticModel semanticModel,
            string projectName
        )
        {
            // Extract classes
            foreach (
                var classDeclaration in root.DescendantNodes().OfType<ClassDeclarationSyntax>()
            )
            {
                var symbol = semanticModel.GetDeclaredSymbol(classDeclaration);
                if (symbol == null)
                    continue;

                var entity = new CodeEntity
                {
                    Id = symbol.ToDisplayString(),
                    Name = symbol.Name,
                    FullName = symbol.ToDisplayString(),
                    Type = "Class",
                    ProjectName = projectName,
                    IsController = symbol.Name.EndsWith("Controller"),
                    IsService = symbol.Name.EndsWith("Service"),
                    IsRepository = symbol.Name.EndsWith("Repository"),
                    Namespace = symbol.ContainingNamespace.ToDisplayString(),
                };

                _entities[entity.Id] = entity;
            }

            // Extract interfaces
            foreach (
                var interfaceDeclaration in root.DescendantNodes()
                    .OfType<InterfaceDeclarationSyntax>()
            )
            {
                var symbol = semanticModel.GetDeclaredSymbol(interfaceDeclaration);
                if (symbol == null)
                    continue;

                var entity = new CodeEntity
                {
                    Id = symbol.ToDisplayString(),
                    Name = symbol.Name,
                    FullName = symbol.ToDisplayString(),
                    Type = "Interface",
                    ProjectName = projectName,
                    Namespace = symbol.ContainingNamespace.ToDisplayString(),
                };

                _entities[entity.Id] = entity;
            }
        }

        private void ExtractRelationships(
            SyntaxNode root,
            SemanticModel semanticModel,
            string projectName
        )
        {
            // Extract inheritance relationships
            foreach (
                var classDeclaration in root.DescendantNodes().OfType<ClassDeclarationSyntax>()
            )
            {
                var symbol = semanticModel.GetDeclaredSymbol(classDeclaration);
                if (symbol == null)
                    continue;

                var classId = symbol.ToDisplayString();

                // Base class relationships
                if (symbol.BaseType != null && !symbol.BaseType.Name.Equals("Object"))
                {
                    var baseTypeId = symbol.BaseType.ToDisplayString();

                    _relationships.Add(
                        new CodeRelationship
                        {
                            SourceId = classId,
                            TargetId = baseTypeId,
                            Type = "Inherits",
                        }
                    );
                }

                // Interface implementations
                foreach (var implementedInterface in symbol.Interfaces)
                {
                    var interfaceId = implementedInterface.ToDisplayString();

                    _relationships.Add(
                        new CodeRelationship
                        {
                            SourceId = classId,
                            TargetId = interfaceId,
                            Type = "Implements",
                        }
                    );
                }
            }

            // Extract dependency relationships (through constructor injection)
            foreach (
                var classDeclaration in root.DescendantNodes().OfType<ClassDeclarationSyntax>()
            )
            {
                var constructors = classDeclaration
                    .DescendantNodes()
                    .OfType<ConstructorDeclarationSyntax>();
                var classSymbol = semanticModel.GetDeclaredSymbol(classDeclaration);

                if (classSymbol == null)
                    continue;

                var classId = classSymbol.ToDisplayString();

                foreach (var constructor in constructors)
                {
                    foreach (var parameter in constructor.ParameterList.Parameters)
                    {
                        var parameterType = semanticModel.GetTypeInfo(parameter.Type).Type;
                        if (parameterType == null)
                            continue;

                        var parameterTypeId = parameterType.ToDisplayString();

                        _relationships.Add(
                            new CodeRelationship
                            {
                                SourceId = classId,
                                TargetId = parameterTypeId,
                                Type = "Depends",
                            }
                        );
                    }
                }
            }
        }

        public Dictionary<string, CodeEntity> GetEntities() => _entities;

        public List<CodeRelationship> GetRelationships() => _relationships;
    }
}
