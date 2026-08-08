using ms_departamentos.DTOs;

namespace ms_departamentos.Interfaces
{
    public interface IDepartamentoService
    {
        Task<IEnumerable<DepartamentoDTO>> ListarAsync();

        Task<DepartamentoDTO?> ObtenerAsync(int id);

        Task<DepartamentoDTO> RegistrarAsync(
            CrearDepartamentoDTO dto);

        Task<DepartamentoDTO?> ActualizarAsync(
            int id,
            ActualizarDepartamentoDTO dto);

        Task<bool> EliminarAsync(int id);
    }
}