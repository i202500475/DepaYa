using Microsoft.Data.SqlClient;
using ms_usuarios.Data;
using ms_usuarios.DTOs;
using ms_usuarios.Interfaces;
using ms_usuarios.Models;

namespace ms_usuarios.Repositorios
{
    public class UsuarioRepository : IUsuarioRepository
    {
        private readonly ConexionBD _conexion;

        public UsuarioRepository(ConexionBD conexion)
        {
            _conexion = conexion;
        }

        public List<Usuario> Listar()
        {
            var lista = new List<Usuario>();

            using var connection = _conexion.ObtenerConexion();

            string query = @"
                SELECT
                    ID_Usuario,
                    Azure_Object_ID,
                    Nombre,
                    Apellido,
                    Tipo_Documento,
                    Numero_Documento,
                    Correo,
                    Telefono,
                    Rol,
                    Fecha_Registro
                FROM usr.Usuario";

            using var command = new SqlCommand(query, connection);

            connection.Open();

            using var reader = command.ExecuteReader();

            while (reader.Read())
            {
                lista.Add(new Usuario
                {
                    ID_Usuario = Convert.ToInt32(reader["ID_Usuario"]),
                    Azure_Object_ID = reader["Azure_Object_ID"] == DBNull.Value
                        ? null
                        : (Guid?)reader["Azure_Object_ID"],
                    Nombre = reader["Nombre"].ToString()!,
                    Apellido = reader["Apellido"].ToString()!,
                    Tipo_Documento = reader["Tipo_Documento"].ToString()!,
                    Numero_Documento = reader["Numero_Documento"].ToString()!,
                    Correo = reader["Correo"].ToString()!,
                    Telefono = reader["Telefono"].ToString()!,
                    Rol = reader["Rol"].ToString()!,
                    Fecha_Registro = Convert.ToDateTime(reader["Fecha_Registro"])
                });
            }

            return lista;
        }

        public Usuario? Obtener(int id)
        {
            using var connection = _conexion.ObtenerConexion();

            string query = @"
                SELECT
                    ID_Usuario,
                    Azure_Object_ID,
                    Nombre,
                    Apellido,
                    Tipo_Documento,
                    Numero_Documento,
                    Correo,
                    Telefono,
                    Rol,
                    Fecha_Registro
                FROM usr.Usuario
                WHERE ID_Usuario = @ID_Usuario";

            using var command = new SqlCommand(query, connection);

            command.Parameters.AddWithValue("@ID_Usuario", id);

            connection.Open();

            using var reader = command.ExecuteReader();

            if (!reader.Read())
                return null;

            return new Usuario
            {
                ID_Usuario = Convert.ToInt32(reader["ID_Usuario"]),
                Azure_Object_ID = reader["Azure_Object_ID"] == DBNull.Value
                    ? null
                    : (Guid?)reader["Azure_Object_ID"],
                Nombre = reader["Nombre"].ToString()!,
                Apellido = reader["Apellido"].ToString()!,
                Tipo_Documento = reader["Tipo_Documento"].ToString()!,
                Numero_Documento = reader["Numero_Documento"].ToString()!,
                Correo = reader["Correo"].ToString()!,
                Telefono = reader["Telefono"].ToString()!,
                Rol = reader["Rol"].ToString()!,
                Fecha_Registro = Convert.ToDateTime(reader["Fecha_Registro"])
            };
        }

        public void Registrar(CrearUsuarioDTO usuario)
        {
            using var connection = _conexion.ObtenerConexion();

            string query = @"
                INSERT INTO usr.Usuario
                (
                    Azure_Object_ID,
                    Nombre,
                    Apellido,
                    Tipo_Documento,
                    Numero_Documento,
                    Correo,
                    Telefono,
                    Rol
                )
                VALUES
                (
                    @Azure_Object_ID,
                    @Nombre,
                    @Apellido,
                    @Tipo_Documento,
                    @Numero_Documento,
                    @Correo,
                    @Telefono,
                    @Rol
                )";

            using var command = new SqlCommand(query, connection);

            command.Parameters.AddWithValue(
                "@Azure_Object_ID",
                usuario.Azure_Object_ID ?? (object)DBNull.Value);

            command.Parameters.AddWithValue("@Nombre", usuario.Nombre);
            command.Parameters.AddWithValue("@Apellido", usuario.Apellido);
            command.Parameters.AddWithValue("@Tipo_Documento", usuario.Tipo_Documento);
            command.Parameters.AddWithValue("@Numero_Documento", usuario.Numero_Documento);
            command.Parameters.AddWithValue("@Correo", usuario.Correo);
            command.Parameters.AddWithValue("@Telefono", usuario.Telefono);
            command.Parameters.AddWithValue("@Rol", usuario.Rol);

            connection.Open();
            command.ExecuteNonQuery();
        }

        public void Actualizar(int id, ActualizarUsuarioDTO usuario)
        {
            using var connection = _conexion.ObtenerConexion();

            string query = @"
                UPDATE usr.Usuario
                SET
                    Nombre = @Nombre,
                    Apellido = @Apellido,
                    Tipo_Documento = @Tipo_Documento,
                    Numero_Documento = @Numero_Documento,
                    Correo = @Correo,
                    Telefono = @Telefono,
                    Rol = @Rol
                WHERE ID_Usuario = @ID_Usuario";

            using var command = new SqlCommand(query, connection);

            command.Parameters.AddWithValue("@ID_Usuario", id);
            command.Parameters.AddWithValue("@Nombre", usuario.Nombre);
            command.Parameters.AddWithValue("@Apellido", usuario.Apellido);
            command.Parameters.AddWithValue("@Tipo_Documento", usuario.Tipo_Documento);
            command.Parameters.AddWithValue("@Numero_Documento", usuario.Numero_Documento);
            command.Parameters.AddWithValue("@Correo", usuario.Correo);
            command.Parameters.AddWithValue("@Telefono", usuario.Telefono);
            command.Parameters.AddWithValue("@Rol", usuario.Rol);

            connection.Open();
            command.ExecuteNonQuery();
        }

        public void Eliminar(int id)
        {
            using var connection = _conexion.ObtenerConexion();

            string query = @"
                DELETE FROM usr.Usuario
                WHERE ID_Usuario = @ID_Usuario";

            using var command = new SqlCommand(query, connection);

            command.Parameters.AddWithValue("@ID_Usuario", id);

            connection.Open();
            command.ExecuteNonQuery();
        }
    }
}