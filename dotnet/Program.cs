using MongoDB.Driver;
using MongoDB.Driver.Core.Extensions.DiagnosticSources;
using OpenTelemetry.Trace;
using OpenTelemetry.Resources;

internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        
        //mongodb instrumentation config
        var mongoUrl = MongoUrl.Create("mongodb://localhost:27017");
        var clientSettings = MongoClientSettings.FromUrl(mongoUrl);
        clientSettings.ClusterConfigurator = cb => cb.Subscribe(new DiagnosticsActivityEventSubscriber());
        var mongoClient = new MongoClient(clientSettings);

        //otel config
        var serviceName = "todo-dotnet";
        var serviceVersion = "1.0.0";
        builder.Services.AddOpenTelemetryTracing(tracerProviderBuilder =>
            tracerProviderBuilder
                .AddOtlpExporter(opt =>
                {
                    opt.Endpoint = new Uri("https://collector.aspecto.io:4317/v1/traces");
                    opt.Headers = $"Authorization={Environment.GetEnvironmentVariable("ASPECTO_API_KEY")}";
                })
                .AddSource(serviceName)
                .SetResourceBuilder(
                    ResourceBuilder.CreateDefault()
                        .AddService(serviceName: serviceName, serviceVersion: serviceVersion))
                .AddHttpClientInstrumentation()
                .AddAspNetCoreInstrumentation()
                .AddMongoDBInstrumentation()
        );

        //dependency injection config
        builder.Services.AddControllers();
        builder.Services.AddSingleton(mongoClient.GetDatabase("todo"));
        var app = builder.Build();
        app.MapControllers();
        app.Run();
    }
}