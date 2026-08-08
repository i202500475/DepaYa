using ms_usuarios.Data;
using ms_usuarios.Interfaces;
using ms_usuarios.Repositorios;
using ms_usuarios.Services;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Base de datos
builder.Services.AddScoped<ConexionBD>();

// Repository
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();

// Service
builder.Services.AddScoped<IUsuarioService, UsuarioService>();

var app = builder.Build();

// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();