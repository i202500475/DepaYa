using System.ComponentModel.DataAnnotations;

namespace ms_reservas.DTOs
{
    public class ActualizarReservaDTO
    {
        [Required]
        public int ID_Departamento { get; set; }

        [Required]
        public int ID_Inquilino { get; set; }

        [Required]
        public DateTime Fecha_Ingreso { get; set; }

        [Required]
        public DateTime Fecha_Salida { get; set; }

        [Required]
        [Range(1, 20)]
        public int Cantidad_Huespedes { get; set; }

        [Required]
        public string Estado { get; set; } = string.Empty;
    }
}