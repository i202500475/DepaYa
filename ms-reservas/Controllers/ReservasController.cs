using Microsoft.AspNetCore.Mvc;
using ms_reservas.DTOs;
using ms_reservas.Interfaces;

namespace ms_reservas.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservaController : ControllerBase
    {
        private readonly IReservaService _service;

        public ReservaController(IReservaService service)
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
            var reserva = _service.Obtener(id);

            if (reserva == null)
            {
                return NotFound(new
                {
                    mensaje = "Reserva no encontrada"
                });
            }

            return Ok(reserva);
        }

        [HttpPost]
        public IActionResult Registrar(CrearReservaDTO reserva)
        {
            _service.Registrar(reserva);

            return Ok(new
            {
                mensaje = "Reserva registrada correctamente"
            });
        }

        [HttpPut("{id}")]
        public IActionResult Actualizar(
            int id,
            ActualizarReservaDTO reserva)
        {
            _service.Actualizar(id, reserva);

            return Ok(new
            {
                mensaje = "Reserva actualizada correctamente"
            });
        }

        [HttpDelete("{id}")]
        public IActionResult Eliminar(int id)
        {
            _service.Eliminar(id);

            return Ok(new
            {
                mensaje = "Reserva eliminada correctamente"
            });
        }
    }
}