using CodeKnowledgeGraphGenerator.TestNamespace;
namespace CodeKnowledgeGraphGenerator.Models;
 
    public class CodeEntity : CodeKnowledgeGraphGenerator.TestNamespace.BaseClass
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string FullName { get; set; }
        public string Type { get; set; }  // Class, Interface, Enum, etc.
        public string ProjectName { get; set; }
        public bool IsController { get; set; }
        public bool IsService { get; set; }
        public bool IsRepository { get; set; }
        public string Namespace { get; set; }
    }
 