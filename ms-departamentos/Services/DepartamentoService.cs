using ms_departamentos.DTOs;
using ms_departamentos.Interfaces;

namespace ms_departamentos.Services
{
    public class DepartamentoService : IDepartamentoService
    {
        private readonly IDepartamentoRepository _departamentoRepository;

        public DepartamentoService(IDepartamentoRepository departamentoRepository)
        {
            _departamentoRepository = departamentoRepository;
        }

        public async Task<IEnumerable<DepartamentoDTO>> ListarAsync()
        {
            return await _departamentoRepository.ListarAsync();
        }

        public async Task<DepartamentoDTO?> ObtenerAsync(int id)
        {
            return await _departamentoRepository.ObtenerAsync(id);
        }

        public async Task<DepartamentoDTO> RegistrarAsync(
            CrearDepartamentoDTO dto)
        {
            return await _departamentoRepository.RegistrarAsync(dto);
        }

        public async Task<DepartamentoDTO?> ActualizarAsync(
            int id,
            ActualizarDepartamentoDTO dto)
        {
            return await _departamentoRepository.ActualizarAsync(id, dto);
        }

        public async Task<bool> EliminarAsync(int id)
        {
            return await _departamentoRepository.EliminarAsync(id);
        }
    }
}