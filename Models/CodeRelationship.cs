namespace CodeKnowledgeGraphGenerator.Models
{
    public class CodeRelationship
    {
        public string SourceId { get; set; }
        public string TargetId { get; set; }
        public string Type { get; set; }  // Inherits, Implements, Depends, etc.
    }
}