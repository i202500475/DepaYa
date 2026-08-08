using Microsoft.AspNetCore.Mvc;
using ms_pagos.DTOs;
using ms_pagos.Interfaces;

namespace ms_pagos.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PagoController : ControllerBase
    {
        private readonly IPagoService _service;

        public PagoController(IPagoService service)
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
            var pago = _service.Obtener(id);

            if (pago == null)
            {
                return NotFound(new
                {
                    mensaje = "Pago no encontrado"
                });
            }

            return Ok(pago);
        }

        [HttpPost]
        public IActionResult Registrar(CrearPagoDTO pago)
        {
            _service.Registrar(pago);

            return Ok(new
            {
                mensaje = "Pago registrado correctamente"
            });
        }

        [HttpPut("{id}")]
        public IActionResult Actualizar(
            int id,
            ActualizarPagoDTO pago)
        {
            _service.Actualizar(id, pago);

            return Ok(new
            {
                mensaje = "Pago actualizado correctamente"
            });
        }

        [HttpDelete("{id}")]
        public IActionResult Eliminar(int id)
        {
            _service.Eliminar(id);

            return Ok(new
            {
                mensaje = "Pago eliminado correctamente"
            });
        }
    }
}