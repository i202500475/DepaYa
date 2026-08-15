using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using ms_usuarios.Data;
using ms_usuarios.Interfaces;
using ms_usuarios.Repositorios;
using ms_usuarios.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// CONTROLLERS
// ==========================================

builder.Services.AddControllers();

// ==========================================
// SWAGGER
// ==========================================

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ==========================================
// DEPENDENCIAS - BASE DE DATOS
// ==========================================

builder.Services.AddScoped<ConexionBD>();

// ==========================================
// REPOSITORY
// ==========================================

builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();

// ==========================================
// SERVICE
// ==========================================

// Registramos la interfaz
builder.Services.AddScoped<IUsuarioService, UsuarioService>();

// Registramos también la clase concreta
// porque UsuariosController recibe UsuarioService
builder.Services.AddScoped<UsuarioService>();

// ==========================================
// JWT
// ==========================================

var jwtKey = builder.Configuration["Jwt:Key"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException(
        "No se encontró Jwt:Key en appsettings.json"
    );
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtKey)
                    ),

                ValidateIssuer = false,

                ValidateAudience = false,

                ValidateLifetime = true,

                ClockSkew = TimeSpan.Zero
            };
    });

// ==========================================
// AUTHORIZATION
// ==========================================

builder.Services.AddAuthorization();

// ==========================================
// CORS
// ==========================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("DepaYaPolicy", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ==========================================
// APP
// ==========================================

var app = builder.Build();

// ==========================================
// SWAGGER
// ==========================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ==========================================
// MIDDLEWARE
// ==========================================

app.UseHttpsRedirection();

app.UseCors("DepaYaPolicy");

// IMPORTANTE:
// Authentication ANTES de Authorization
app.UseAuthentication();

app.UseAuthorization();

// ==========================================
// CONTROLLERS
// ==========================================

app.MapControllers();

app.Run();