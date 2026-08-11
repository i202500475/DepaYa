namespace ms_usuarios.DTOs
{
    public class UsuarioDTO
    {
        public int ID_Usuario { get; set; }

        public Guid? Azure_Object_ID { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public string Apellido { get; set; } = string.Empty;

        public string Tipo_Documento { get; set; } = string.Empty;

        public string Numero_Documento { get; set; } = string.Empty;

        public string Correo { get; set; } = string.Empty;

        public string Telefono { get; set; } = string.Empty;

        public string Rol { get; set; } = string.Empty;

        public DateTime Fecha_Registro { get; set; }
    }
}
