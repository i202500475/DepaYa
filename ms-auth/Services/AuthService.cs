using Microsoft.IdentityModel.Tokens;
using ms_auth.DTOs;
using ms_auth.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ms_auth.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IConfiguration _configuration;

        public AuthService(
            IAuthRepository authRepository,
            IConfiguration configuration)
        {
            _authRepository = authRepository;
            _configuration = configuration;
        }

        public async Task<AuthResponseDTO?> AutenticarAsync(
            Guid azureObjectId)
        {
            var usuario =
                await _authRepository.AutenticarAsync(
                    azureObjectId
                );

            if (usuario == null)
            {
                return null;
            }

            var token = GenerarToken(usuario);

            usuario.Token = token;

            return usuario;
        }

        private string GenerarToken(AuthResponseDTO usuario)
        {
            var key =
                _configuration["Jwt:Key"];

            if (string.IsNullOrWhiteSpace(key))
            {
                throw new InvalidOperationException(
                    "No se encontró Jwt:Key en appsettings.json"
                );
            }

            var securityKey =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(key)
                );

            var credentials =
                new SigningCredentials(
                    securityKey,
                    SecurityAlgorithms.HmacSha256
                );

            var claims = new List<Claim>
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    usuario.ID_Usuario.ToString()
                ),

                new Claim(
                    ClaimTypes.Name,
                    usuario.Correo
                ),

                new Claim(
                    ClaimTypes.GivenName,
                    usuario.Nombre
                ),

                new Claim(
                    ClaimTypes.Surname,
                    usuario.Apellido
                ),

                new Claim(
                    ClaimTypes.Role,
                    usuario.Rol
                )
            };

            var tokenDescriptor =
                new JwtSecurityToken(
                    claims: claims,
                    expires: DateTime.UtcNow.AddHours(8),
                    signingCredentials: credentials
                );

            return new JwtSecurityTokenHandler()
                .WriteToken(tokenDescriptor);
        }
    }
}