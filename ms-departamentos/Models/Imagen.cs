namespace ms_departamentos.Models
{
    public class Imagen
    {
        public int ID_Imagen { get; set; }

        public int ID_Departamento { get; set; }

        public string URL_Imagen { get; set; } = string.Empty;

        public bool Es_Principal { get; set; }
    }
}