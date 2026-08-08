namespace ms_pagos.DTOs
{
    public class PagoDTO
    {
        public int ID_Pago { get; set; }

        public int ID_Reserva { get; set; }

        public decimal Monto_Total { get; set; }

        public string Moneda { get; set; } = "PEN";

        public string Metodo_Pago { get; set; } = string.Empty;

        public string Estado_Pago { get; set; } = string.Empty;

        public DateTime Fecha_Transaccion { get; set; }

        public string? Pasarela_Transaccion_ID { get; set; }
    }
}