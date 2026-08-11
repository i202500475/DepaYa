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

        // =========================================================
        // LISTAR USUARIOS
        // GET /api/Usuarios
        // =========================================================
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
                lista.Add(MapearUsuario(reader));
            }

            return lista;
        }

        // =========================================================
        // OBTENER USUARIO
        // GET /api/Usuarios/{id}
        // =========================================================
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

            command.Parameters.Add(
                "@ID_Usuario",
                System.Data.SqlDbType.Int
            ).Value = id;

            connection.Open();

            using var reader = command.ExecuteReader();

            if (!reader.Read())
            {
                return null;
            }

            return MapearUsuario(reader);
        }

        // =========================================================
        // REGISTRAR USUARIO
        // POST /api/Usuarios
        // =========================================================
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

            command.Parameters.Add(
                "@Azure_Object_ID",
                System.Data.SqlDbType.UniqueIdentifier
            ).Value = usuario.Azure_Object_ID ?? (object)DBNull.Value;

            command.Parameters.Add(
                "@Nombre",
                System.Data.SqlDbType.NVarChar,
                100
            ).Value = usuario.Nombre;

            command.Parameters.Add(
                "@Apellido",
                System.Data.SqlDbType.NVarChar,
                100
            ).Value = usuario.Apellido;

            command.Parameters.Add(
                "@Tipo_Documento",
                System.Data.SqlDbType.NVarChar,
                20
            ).Value = usuario.Tipo_Documento;

            command.Parameters.Add(
                "@Numero_Documento",
                System.Data.SqlDbType.NVarChar,
                20
            ).Value = usuario.Numero_Documento;

            command.Parameters.Add(
                "@Correo",
                System.Data.SqlDbType.NVarChar,
                150
            ).Value = usuario.Correo;

            command.Parameters.Add(
                "@Telefono",
                System.Data.SqlDbType.NVarChar,
                15
            ).Value = usuario.Telefono;

            command.Parameters.Add(
                "@Rol",
                System.Data.SqlDbType.NVarChar,
                20
            ).Value = usuario.Rol;

            connection.Open();

            command.ExecuteNonQuery();
        }

        // =========================================================
        // ACTUALIZAR USUARIO
        // PUT /api/Usuarios/{id}
        // =========================================================
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

            command.Parameters.Add(
                "@ID_Usuario",
                System.Data.SqlDbType.Int
            ).Value = id;

            command.Parameters.Add(
                "@Nombre",
                System.Data.SqlDbType.NVarChar,
                100
            ).Value = usuario.Nombre;

            command.Parameters.Add(
                "@Apellido",
                System.Data.SqlDbType.NVarChar,
                100
            ).Value = usuario.Apellido;

            command.Parameters.Add(
                "@Tipo_Documento",
                System.Data.SqlDbType.NVarChar,
                20
            ).Value = usuario.Tipo_Documento;

            command.Parameters.Add(
                "@Numero_Documento",
                System.Data.SqlDbType.NVarChar,
                20
            ).Value = usuario.Numero_Documento;

            command.Parameters.Add(
                "@Correo",
                System.Data.SqlDbType.NVarChar,
                150
            ).Value = usuario.Correo;

            command.Parameters.Add(
                "@Telefono",
                System.Data.SqlDbType.NVarChar,
                15
            ).Value = usuario.Telefono;

            command.Parameters.Add(
                "@Rol",
                System.Data.SqlDbType.NVarChar,
                20
            ).Value = usuario.Rol;

            connection.Open();

            command.ExecuteNonQuery();
        }

        // =========================================================
        // ELIMINAR USUARIO
        // DELETE /api/Usuarios/{id}
        // =========================================================
        public void Eliminar(int id)
        {
            using var connection = _conexion.ObtenerConexion();

            string query = @"
                DELETE FROM usr.Usuario
                WHERE ID_Usuario = @ID_Usuario";

            using var command = new SqlCommand(query, connection);

            command.Parameters.Add(
                "@ID_Usuario",
                System.Data.SqlDbType.Int
            ).Value = id;

            connection.Open();

            command.ExecuteNonQuery();
        }

        // =========================================================
        // MAPEAR DATOS DE SQL SERVER → OBJETO USUARIO
        // =========================================================
        private Usuario MapearUsuario(SqlDataReader reader)
        {
            return new Usuario
            {
                ID_Usuario = Convert.ToInt32(
                    reader["ID_Usuario"]
                ),

                Azure_Object_ID =
                    reader["Azure_Object_ID"] == DBNull.Value
                        ? null
                        : (Guid?)reader["Azure_Object_ID"],

                Nombre = reader["Nombre"].ToString() ?? string.Empty,

                Apellido = reader["Apellido"].ToString() ?? string.Empty,

                Tipo_Documento =
                    reader["Tipo_Documento"].ToString() ?? string.Empty,

                Numero_Documento =
                    reader["Numero_Documento"].ToString() ?? string.Empty,

                Correo =
                    reader["Correo"].ToString() ?? string.Empty,

                Telefono =
                    reader["Telefono"].ToString() ?? string.Empty,

                Rol =
                    reader["Rol"].ToString() ?? string.Empty,

                Fecha_Registro =
                    Convert.ToDateTime(reader["Fecha_Registro"])
            };
        }
    }
}