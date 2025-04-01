using System.Collections.Generic;

namespace CodeKnowledgeGraphGenerator
{
    public class CodeEntity
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

    public class CodeRelationship
    {
        public string SourceId { get; set; }
        public string TargetId { get; set; }
        public string Type { get; set; }  // Inherits, Implements, Depends, etc.
    }
}