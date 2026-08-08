using Microsoft.AspNetCore.Mvc;
using ms_departamentos.DTOs;
using ms_departamentos.Interfaces;

namespace ms_departamentos.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DepartamentoController : ControllerBase
    {
        private readonly IDepartamentoService _departamentoService;

        public DepartamentoController(IDepartamentoService departamentoService)
        {
            _departamentoService = departamentoService;
        }

        // GET: api/Departamento
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DepartamentoDTO>>> Listar()
        {
            var departamentos = await _departamentoService.ListarAsync();

            return Ok(departamentos);
        }

        // GET: api/Departamento/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DepartamentoDTO>> Obtener(int id)
        {
            var departamento = await _departamentoService.ObtenerAsync(id);

            if (departamento == null)
            {
                return NotFound(new
                {
                    mensaje = "Departamento no encontrado."
                });
            }

            return Ok(departamento);
        }

        // POST: api/Departamento
        [HttpPost]
        public async Task<ActionResult<DepartamentoDTO>> Registrar(
            [FromBody] CrearDepartamentoDTO dto)
        {
            var departamento = await _departamentoService.RegistrarAsync(dto);

            return CreatedAtAction(
                nameof(Obtener),
                new { id = departamento.ID_Departamento },
                departamento);
        }

        // PUT: api/Departamento/5
        [HttpPut("{id}")]
        public async Task<ActionResult<DepartamentoDTO>> Actualizar(
            int id,
            [FromBody] ActualizarDepartamentoDTO dto)
        {
            var departamento = await _departamentoService.ActualizarAsync(id, dto);

            if (departamento == null)
            {
                return NotFound(new
                {
                    mensaje = "Departamento no encontrado."
                });
            }

            return Ok(departamento);
        }

        // DELETE: api/Departamento/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var eliminado = await _departamentoService.EliminarAsync(id);

            if (!eliminado)
            {
                return NotFound(new
                {
                    mensaje = "Departamento no encontrado."
                });
            }

            return Ok(new
            {
                mensaje = "Departamento eliminado correctamente."
            });
        }
    }
}