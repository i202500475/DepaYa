using ms_reservas.DTOs;
using ms_reservas.Interfaces;

namespace ms_reservas.Services
{
    public class ReservaService : IReservaService
    {
        private readonly IReservaRepository _repository;

        public ReservaService(IReservaRepository repository)
        {
            _repository = repository;
        }

        public List<ReservaDTO> Listar()
        {
            var reservas = _repository.Listar();

            return reservas.Select(r => new ReservaDTO
            {
                ID_Reserva = r.ID_Reserva,
                ID_Departamento = r.ID_Departamento,
                ID_Inquilino = r.ID_Inquilino,
                Fecha_Ingreso = r.Fecha_Ingreso,
                Fecha_Salida = r.Fecha_Salida,
                Cantidad_Huespedes = r.Cantidad_Huespedes,
                Estado = r.Estado,
                Fecha_Creacion = r.Fecha_Creacion
            }).ToList();
        }

        public ReservaDTO? Obtener(int id)
        {
            var reserva = _repository.Obtener(id);

            if (reserva == null)
                return null;

            return new ReservaDTO
            {
                ID_Reserva = reserva.ID_Reserva,
                ID_Departamento = reserva.ID_Departamento,
                ID_Inquilino = reserva.ID_Inquilino,
                Fecha_Ingreso = reserva.Fecha_Ingreso,
                Fecha_Salida = reserva.Fecha_Salida,
                Cantidad_Huespedes = reserva.Cantidad_Huespedes,
                Estado = reserva.Estado,
                Fecha_Creacion = reserva.Fecha_Creacion
            };
        }

        public void Registrar(CrearReservaDTO reserva)
        {
            _repository.Registrar(reserva);
        }

        public void Actualizar(
            int id,
            ActualizarReservaDTO reserva)
        {
            _repository.Actualizar(id, reserva);
        }

        public void Eliminar(int id)
        {
            _repository.Eliminar(id);
        }
    }
}
