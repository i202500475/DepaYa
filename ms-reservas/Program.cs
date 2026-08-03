using ms_reservas.Data;
using ms_reservas.Interfaces;
using ms_reservas.Repositorios;
using ms_reservas.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
builder.Services.AddScoped<ConexionBD>();

builder.Services.AddScoped<IReservaRepository, ReservaRepository>();

builder.Services.AddScoped<IReservaService, ReservaService>();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
