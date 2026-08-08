using Microsoft.AspNetCore.Mvc;
using ms_usuarios.DTOs;
using ms_usuarios.Interfaces;

namespace ms_usuarios.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly IUsuarioService _service;

        public UsuariosController(IUsuarioService service)
        {
            _service = service;
        }

        [HttpGet]
        public IActionResult Listar()
        {
            return Ok(_service.Listar());
        }

        [HttpGet("{id}")]
        public IActionResult Obtener(int id)
        {
            var usuario = _service.Obtener(id);

            if (usuario == null)
            {
                return NotFound(new
                {
                    mensaje = "Usuario no encontrado"
                });
            }

            return Ok(usuario);
        }

        [HttpPost]
        public IActionResult Registrar(CrearUsuarioDTO usuario)
        {
            _service.Registrar(usuario);

            return Ok(new
            {
                mensaje = "Usuario registrado correctamente"
            });
        }

        [HttpPut("{id}")]
        public IActionResult Actualizar(
            int id,
            ActualizarUsuarioDTO usuario)
        {
            _service.Actualizar(id, usuario);

            return Ok(new
            {
                mensaje = "Usuario actualizado correctamente"
            });
        }

        [HttpDelete("{id}")]
        public IActionResult Eliminar(int id)
        {
            _service.Eliminar(id);

            return Ok(new
            {
                mensaje = "Usuario eliminado correctamente"
            });
        }
    }
}