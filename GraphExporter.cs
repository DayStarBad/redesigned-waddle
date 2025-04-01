using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;

namespace CodeKnowledgeGraphGenerator
{
    public class GraphExporter
    {
        public static void ExportToJson(Dictionary<string, CodeEntity> entities, 
                                      List<CodeRelationship> relationships, 
                                      string outputPath)
        {
            var graph = new
            {
                Nodes = entities.Values,
                Links = relationships
            };

            var json = JsonConvert.SerializeObject(graph, Formatting.Indented);
            File.WriteAllText(outputPath, json);
        }

        public static void ExportToD3Format(Dictionary<string, CodeEntity> entities, 
                                         List<CodeRelationship> relationships, 
                                         string outputPath)
        {
            var nodes = new List<object>();
            var links = new List<object>();

            foreach (var entity in entities.Values)
            {
                string group;
                if (entity.IsController) group = "controller";
                else if (entity.IsService) group = "service";
                else if (entity.IsRepository) group = "repository";
                else if (entity.Type == "Interface") group = "interface";
                else if (entity.Namespace?.Contains(".Models") == true) group = "model";
                else group = "class";

                nodes.Add(new
                {
                    id = entity.Id,
                    name = entity.Name,
                    group,
                    namespace = entity.Namespace
                });
            }

            foreach (var relationship in relationships)
            {
                // Only include relationships where both source and target exist
                if (entities.ContainsKey(relationship.SourceId) && 
                    entities.ContainsKey(relationship.TargetId))
                {
                    links.Add(new
                    {
                        source = relationship.SourceId,
                        target = relationship.TargetId,
                        type = relationship.Type
                    });
                }
            }

            var graph = new
            {
                nodes,
                links
            };

            var json = JsonConvert.SerializeObject(graph, Formatting.Indented);
            File.WriteAllText(outputPath, json);
        }
    }
}