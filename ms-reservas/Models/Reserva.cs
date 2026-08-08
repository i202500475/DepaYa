namespace ms_reservas.Models
{
    public class Reserva
    {
        public int ID_Reserva { get; set; }

        public int ID_Departamento { get; set; }

        public int ID_Inquilino { get; set; }

        public DateTime Fecha_Ingreso { get; set; }

        public DateTime Fecha_Salida { get; set; }

        public int Cantidad_Huespedes { get; set; }

        public string Estado { get; set; } = "Pendiente";

        public DateTime Fecha_Creacion { get; set; }
    }
}