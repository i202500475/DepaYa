using Microsoft.AspNetCore.Mvc;
using ms_reservas.DTOs;
using ms_reservas.Services;

namespace ms_reservas.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservasController : ControllerBase
    {
        private readonly ReservaService _reservaService;

        public ReservasController(ReservaService reservaService)
        {
            _reservaService = reservaService;
        }

        // GET: api/reservas
        [HttpGet]
        public IActionResult Listar()
        {
            var reservas = _reservaService.Listar();
            return Ok(reservas);
        }

        // GET: api/reservas/5
        [HttpGet("{id}")]
        public IActionResult Obtener(int id)
        {
            var reserva = _reservaService.Obtener(id);

            if (reserva == null)
                return NotFound(new { mensaje = "Reserva no encontrada." });

            return Ok(reserva);
        }

        // POST: api/reservas
        [HttpPost]
        public IActionResult Registrar([FromBody] CrearReservaDTO reserva)
        {
            _reservaService.Registrar(reserva);

            return Ok(new
            {
                mensaje = "Reserva registrada correctamente."
            });
        }

        // PUT: api/reservas/5
        [HttpPut("{id}")]
        public IActionResult Actualizar(int id, [FromBody] ActualizarReservaDTO reserva)
        {
            _reservaService.Actualizar(id, reserva);

            return Ok(new
            {
                mensaje = "Reserva actualizada correctamente."
            });
        }

        // DELETE: api/reservas/5
        [HttpDelete("{id}")]
        public IActionResult Eliminar(int id)
        {
            _reservaService.Eliminar(id);

            return Ok(new
            {
                mensaje = "Reserva eliminada correctamente."
            });
        }
    }
}