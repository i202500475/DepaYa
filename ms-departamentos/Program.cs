using ms_departamentos.Data;
using ms_departamentos.Interfaces;
using ms_departamentos.Repositorios;
using ms_departamentos.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddScoped<ConexionBD>();
builder.Services.AddScoped<IDepartamentoRepository, DepartamentoRepository>();
builder.Services.AddScoped<IDepartamentoService, DepartamentoService>();

var app = builder.Build();

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
