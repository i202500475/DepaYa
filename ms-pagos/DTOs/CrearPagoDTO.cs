namespace ms_pagos.DTOs
{
    public class CrearPagoDTO
    {
        public int ID_Reserva { get; set; }

        public decimal Monto_Total { get; set; }

        public string Moneda { get; set; } = "PEN";

        public string Metodo_Pago { get; set; } = string.Empty;

        public string? Pasarela_Transaccion_ID { get; set; }
    }
}