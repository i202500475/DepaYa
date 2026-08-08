namespace ms_pagos.DTOs
{
    public class ActualizarPagoDTO
    {
        public string Estado_Pago { get; set; } = string.Empty;

        public string? Pasarela_Transaccion_ID { get; set; }
    }
}