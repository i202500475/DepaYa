namespace ms_reservas.DTOs
{
    public class ActualizarReservaDTO
    {
        public DateTime Fecha_Ingreso { get; set; }

        public DateTime Fecha_Salida { get; set; }

        public int Cantidad_Huespedes { get; set; }

        public string Estado { get; set; } = string.Empty;
    }
}