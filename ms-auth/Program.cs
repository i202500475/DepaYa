using ms_auth.Data;
using ms_auth.Interfaces;
using ms_auth.Repositories;
using ms_auth.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddScoped<ConexionBD>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();

var app = builder.Build();

app.UseHttpsRedirection();

app.MapControllers();

app.Run();