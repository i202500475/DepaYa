using ms_pagos.DTOs;

namespace ms_pagos.Interfaces
{
    public interface IPagoService
    {
        List<PagoDTO> Listar();

        PagoDTO? Obtener(int id);

        void Registrar(CrearPagoDTO pago);

        void Actualizar(int id, ActualizarPagoDTO pago);

        void Eliminar(int id);
    }
}