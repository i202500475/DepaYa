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

        // GET: api/usuarios
        [HttpGet]
        public IActionResult ObtenerTodos()
        {
            var usuarios = _usuarioService.ObtenerTodos();
            return Ok(usuarios);
        }

        // GET: api/usuarios/5
        [HttpGet("{id}")]
        public IActionResult ObtenerPorId(int id)
        {
            var usuario = _usuarioService.ObtenerPorId(id);

            if (usuario == null)
                return NotFound(new { mensaje = "Usuario no encontrado." });

            return Ok(usuario);
        }

        // POST: api/usuarios
        [HttpPost]
        public IActionResult Registrar([FromBody] CrearUsuarioDTO usuario)
        {
            _usuarioService.Registrar(usuario);

            return Ok(new
            {
                mensaje = "Usuario registrado correctamente."
            });
        }

        // PUT: api/usuarios/5
        [HttpPut("{id}")]
        public IActionResult Actualizar(int id, [FromBody] ActualizarUsuarioDTO usuario)
        {
            _usuarioService.Actualizar(id, usuario);

            return Ok(new
            {
                mensaje = "Usuario actualizado correctamente."
            });
        }

        // DELETE: api/usuarios/5
        [HttpDelete("{id}")]
        public IActionResult Eliminar(int id)
        {
            _usuarioService.Eliminar(id);

            return Ok(new
            {
                mensaje = "Usuario eliminado correctamente."
            });
        }
    }
}
