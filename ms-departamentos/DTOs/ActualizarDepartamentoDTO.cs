namespace ms_departamentos.DTOs
{
    public class ActualizarDepartamentoDTO
    {
        public string Titulo { get; set; } = string.Empty;

        public string Descripcion { get; set; } = string.Empty;

        public string Distrito { get; set; } = string.Empty;

        public string Direccion { get; set; } = string.Empty;

        public decimal? Latitud { get; set; }

        public decimal? Longitud { get; set; }

        public decimal Precio_Noche { get; set; }

        public int Capacidad_Personas { get; set; }

        public int Habitaciones { get; set; }

        public int Banos { get; set; }

        public string Estado { get; set; } = "Disponible";
    }
}