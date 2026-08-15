using Yarp.ReverseProxy.Configuration;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// API GATEWAY
// ==========================================

builder.Services
    .AddReverseProxy()
    .LoadFromMemory(
        GetRoutes(),
        GetClusters()
    );

var app = builder.Build();

// ==========================================
// RUTA PRINCIPAL
// ==========================================

app.MapGet("/", () => new
{
    mensaje = "API Gateway DepaYa funcionando",
    estado = "OK"
});

// ==========================================
// REVERSE PROXY
// ==========================================

app.MapReverseProxy();

app.Run();


// ==========================================
// RUTAS
// ==========================================

static IReadOnlyList<RouteConfig> GetRoutes()
{
    return new[]
    {
        // ======================================
        // MS-AUTH
        // ======================================

        new RouteConfig
        {
            RouteId = "auth-route",

            ClusterId = "auth-cluster",

            Match = new RouteMatch
            {
                Path = "/api/Auth/{**catch-all}"
            }
        },

        // ======================================
        // MS-USUARIOS
        // ======================================

        new RouteConfig
        {
            RouteId = "usuarios-route",

            ClusterId = "usuarios-cluster",

            Match = new RouteMatch
            {
                Path = "/api/Usuarios/{**catch-all}"
            }
        }
    };
}


// ==========================================
// MICROSERVICIOS
// ==========================================

static IReadOnlyList<ClusterConfig> GetClusters()
{
    return new[]
    {
        // ======================================
        // MS-AUTH
        // ======================================

        new ClusterConfig
        {
            ClusterId = "auth-cluster",

            Destinations = new Dictionary<string, DestinationConfig>
            {
                {
                    "auth-destination",
                    new DestinationConfig
                    {
                        Address = "http://localhost:5020/"
                    }
                }
            }
        },

        // ======================================
        // MS-USUARIOS
        // ======================================

        new ClusterConfig
        {
            ClusterId = "usuarios-cluster",

            Destinations = new Dictionary<string, DestinationConfig>
            {
                {
                    "usuarios-destination",
                    new DestinationConfig
                    {
                        Address = "http://localhost:5250/"
                    }
                }
            }
        }
    };
}