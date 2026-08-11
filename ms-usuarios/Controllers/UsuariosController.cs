using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ms_usuarios.DTOs;
using ms_usuarios.Services;

namespace ms_usuarios.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class UsuariosController : ControllerBase
    {
        private readonly UsuarioService _usuarioService;

        public UsuariosController(UsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        // GET: api/Usuarios
        [HttpGet]
        public IActionResult Listar()
        {
            var usuarios = _usuarioService.Listar();

            return Ok(usuarios);
        }

        // GET: api/Usuarios/1
        [HttpGet("{id}")]
        public IActionResult Obtener(int id)
        {
            var usuario = _usuarioService.Obtener(id);

            if (usuario == null)
            {
                return NotFound(new
                {
                    mensaje = "Usuario no encontrado"
                });
            }

            return Ok(usuario);
        }

        // POST: api/Usuarios
        [HttpPost]
        public IActionResult Registrar(
            [FromBody] CrearUsuarioDTO usuario)
        {
            _usuarioService.Registrar(usuario);

            return Ok(new
            {
                mensaje = "Usuario registrado correctamente"
            });
        }

        // PUT: api/Usuarios/1
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

        // DELETE: api/Usuarios/1
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