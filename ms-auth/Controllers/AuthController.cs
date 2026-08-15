using Microsoft.AspNetCore.Mvc;
using ms_auth.DTOs;
using ms_auth.Interfaces;

namespace ms_auth.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // Simulación de autenticación mediante Azure Object ID
        // Ejemplo:
        // GET /api/Auth/usuario/{azureObjectId}

        [HttpGet("usuario/{azureObjectId}")]
        public async Task<ActionResult<AuthResponseDTO>> Autenticar(
            Guid azureObjectId)
        {
            var usuario =
                await _authService.AutenticarAsync(
                    azureObjectId
                );

            if (usuario == null)
            {
                return NotFound(new
                {
                    mensaje = "Usuario no encontrado."
                });
            }

            return Ok(usuario);
        }
    }
}