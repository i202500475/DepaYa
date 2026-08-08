using Microsoft.AspNetCore.Mvc;
using ms_usuarios.DTOs;
using ms_usuarios.Services;

namespace ms_usuarios.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly UsuarioService _usuarioService;

        public UsuariosController(UsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        [HttpGet]
        public IActionResult Listar()
        {
            var usuarios = _usuarioService.Listar();

            return Ok(usuarios);
        }

        [HttpGet("{id}")]
        public IActionResult Obtener(int id)
        {
            var usuario = _usuarioService.Obtener(id);

            if (usuario == null)
                return NotFound(new
                {
                    mensaje = "Usuario no encontrado"
                });

            return Ok(usuario);
        }

        [HttpPost]
        public IActionResult Registrar([FromBody] CrearUsuarioDTO usuario)
        {
            _usuarioService.Registrar(usuario);

            return Ok(new
            {
                mensaje = "Usuario registrado correctamente"
            });
        }

        [HttpPut("{id}")]
        public IActionResult Actualizar(
            int id,
            [FromBody] ActualizarUsuarioDTO usuario)
        {
            _usuarioService.Actualizar(id, usuario);

            return Ok(new
            {
                mensaje = "Usuario actualizado correctamente"
            });
        }

        [HttpDelete("{id}")]
        public IActionResult Eliminar(int id)
        {
            _usuarioService.Eliminar(id);

            return Ok(new
            {
                mensaje = "Usuario eliminado correctamente"
            });
        }
    }
}