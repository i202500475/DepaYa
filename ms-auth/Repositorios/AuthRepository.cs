using Microsoft.Data.SqlClient;
using ms_auth.Data;
using ms_auth.DTOs;
using ms_auth.Interfaces;

namespace ms_auth.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly ConexionBD _conexionBD;

        public AuthRepository(ConexionBD conexionBD)
        {
            _conexionBD = conexionBD;
        }

        public async Task<AuthResponseDTO?> AutenticarAsync(Guid azureObjectId)
        {
            using SqlConnection conexion = _conexionBD.ObtenerConexion();

            await conexion.OpenAsync();

            string sql = @"
                SELECT
                    ID_Usuario,
                    Azure_Object_ID,
                    Nombre,
                    Apellido,
                    Correo,
                    Rol
                FROM usr.Usuario
                WHERE Azure_Object_ID = @AzureObjectId";

            using SqlCommand comando = new SqlCommand(sql, conexion);

            comando.Parameters.AddWithValue("@AzureObjectId", azureObjectId);

            using SqlDataReader reader = await comando.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                return new AuthResponseDTO
                {
                    ID_Usuario = reader.GetInt32(reader.GetOrdinal("ID_Usuario")),
                    Azure_Object_ID = reader.IsDBNull(reader.GetOrdinal("Azure_Object_ID"))
                        ? null
                        : reader.GetGuid(reader.GetOrdinal("Azure_Object_ID")),
                    Nombre = reader.GetString(reader.GetOrdinal("Nombre")),
                    Apellido = reader.GetString(reader.GetOrdinal("Apellido")),
                    Correo = reader.GetString(reader.GetOrdinal("Correo")),
                    Rol = reader.GetString(reader.GetOrdinal("Rol"))
                };
            }

            return null;
        }
    }
}