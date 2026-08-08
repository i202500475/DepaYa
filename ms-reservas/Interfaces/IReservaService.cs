using ms_reservas.DTOs;

namespace ms_reservas.Interfaces
{
    public interface IReservaService
    {
        List<ReservaDTO> Listar();

        ReservaDTO? Obtener(int id);

        void Registrar(CrearReservaDTO reserva);

        void Actualizar(int id, ActualizarReservaDTO reserva);

        void Eliminar(int id);
    }
}