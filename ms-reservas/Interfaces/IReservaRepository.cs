using ms_reservas.DTOs;
using ms_reservas.Models;

namespace ms_reservas.Interfaces
{
    public interface IReservaRepository
    {
        List<Reserva> Listar();

        Reserva? Obtener(int id);

        void Registrar(CrearReservaDTO reserva);

        void Actualizar(int id, ActualizarReservaDTO reserva);

        void Eliminar(int id);
    }
}