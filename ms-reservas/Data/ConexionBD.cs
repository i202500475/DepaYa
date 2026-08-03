using Microsoft.Data.SqlClient;

namespace ms_reservas.Data
{
    public class ConexionBD
    {
        private readonly IConfiguration _configuration;

        public ConexionBD(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        /// <summary>
        /// Devuelve una conexión a SQL Server utilizando la cadena
        /// configurada en appsettings.json.
        /// </summary>
        public SqlConnection ObtenerConexion()
        {
            string? cadenaConexion = _configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrEmpty(cadenaConexion))
            {
                throw new InvalidOperationException(
                    "No se encontró la cadena de conexión 'DefaultConnection'.");
            }

            return new SqlConnection(cadenaConexion);
        }
    }
}