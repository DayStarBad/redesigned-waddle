using System;
 
namespace CodeKnowledgeGraphGenerator.TestNamespace
{
    // Base class
    public class BaseClass 
    {
        public virtual void DoSomething()
        {
            Console.WriteLine("Base class doing something");
        }
    }

    // Derived class - inheritance relationship
    public class DerivedClass : BaseClass
    {
        public override void DoSomething()
        {
            Console.WriteLine("Derived class doing something");
        }
    }

    // Interface
    public interface IService
    {
        void Execute();
    }

    // Implementation of interface
    public class ServiceImplementation : IService
    {
        public void Execute()
        {
            Console.WriteLine("Service executing");
        }
    }

    // Class with dependencies
    public class Controller
    {
        private readonly IService _service;
        private readonly BaseClass _baseObject;

        public Controller(IService service, BaseClass baseObject)
        {
            _service = service;
            _baseObject = baseObject;
        }

        public void Run()
        {
            _service.Execute();
            _baseObject.DoSomething();
        }
    }
}