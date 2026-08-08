using ms_pagos.DTOs;
using ms_pagos.Interfaces;

namespace ms_pagos.Services
{
    public class PagoService : IPagoService
    {
        private readonly IPagoRepository _repository;

        public PagoService(IPagoRepository repository)
        {
            _repository = repository;
        }

        public List<PagoDTO> Listar()
        {
            var pagos = _repository.Listar();

            return pagos.Select(p => new PagoDTO
            {
                ID_Pago = p.ID_Pago,
                ID_Reserva = p.ID_Reserva,
                Monto_Total = p.Monto_Total,
                Moneda = p.Moneda,
                Metodo_Pago = p.Metodo_Pago,
                Estado_Pago = p.Estado_Pago,
                Fecha_Transaccion = p.Fecha_Transaccion,
                Pasarela_Transaccion_ID = p.Pasarela_Transaccion_ID
            }).ToList();
        }

        public PagoDTO? Obtener(int id)
        {
            var pago = _repository.Obtener(id);

            if (pago == null)
                return null;

            return new PagoDTO
            {
                ID_Pago = pago.ID_Pago,
                ID_Reserva = pago.ID_Reserva,
                Monto_Total = pago.Monto_Total,
                Moneda = pago.Moneda,
                Metodo_Pago = pago.Metodo_Pago,
                Estado_Pago = pago.Estado_Pago,
                Fecha_Transaccion = pago.Fecha_Transaccion,
                Pasarela_Transaccion_ID = pago.Pasarela_Transaccion_ID
            };
        }

        public void Registrar(CrearPagoDTO pago)
        {
            _repository.Registrar(pago);
        }

        public void Actualizar(int id, ActualizarPagoDTO pago)
        {
            _repository.Actualizar(id, pago);
        }

        public void Eliminar(int id)
        {
            _repository.Eliminar(id);
        }
    }
}