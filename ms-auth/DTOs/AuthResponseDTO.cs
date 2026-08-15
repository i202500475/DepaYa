namespace ms_auth.DTOs
{
    public class AuthResponseDTO
    {
        public int ID_Usuario { get; set; }

        public Guid? Azure_Object_ID { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public string Apellido { get; set; } = string.Empty;

        public string Correo { get; set; } = string.Empty;

        public string Rol { get; set; } = string.Empty;

        public string Token { get; set; } = string.Empty;
    }
}