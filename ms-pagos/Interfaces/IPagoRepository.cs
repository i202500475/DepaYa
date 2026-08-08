using ms_pagos.DTOs;
using ms_pagos.Models;

namespace ms_pagos.Interfaces
{
    public interface IPagoRepository
    {
        List<Transaccion> Listar();

        Transaccion? Obtener(int id);

        void Registrar(CrearPagoDTO pago);

        void Actualizar(int id, ActualizarPagoDTO pago);

        void Eliminar(int id);
    }
}