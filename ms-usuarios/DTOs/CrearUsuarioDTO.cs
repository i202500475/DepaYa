using System.ComponentModel.DataAnnotations;

namespace ms_usuarios.DTOs
{
    public class CrearUsuarioDTO
    {
        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Apellido { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Tipo_Documento { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Numero_Documento { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(150)]
        public string Correo { get; set; } = string.Empty;

        [Required]
        [Phone]
        [StringLength(15)]
        public string Telefono { get; set; } = string.Empty;

        [Required]
        public string Rol { get; set; } = string.Empty;
    }
}