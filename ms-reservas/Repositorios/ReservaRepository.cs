using Microsoft.Data.SqlClient;
using ms_reservas.Data;
using ms_reservas.DTOs;
using ms_reservas.Interfaces;
using ms_reservas.Models;

namespace ms_reservas.Repositorios
{
    public class ReservaRepository : IReservaRepository
    {
        private readonly ConexionBD _conexion;

        public ReservaRepository(ConexionBD conexion)
        {
            _conexion = conexion;
        }

        public List<Reserva> Listar()
        {
            var lista = new List<Reserva>();

            using var connection = _conexion.ObtenerConexion();

            string query = @"
                SELECT
                    ID_Reserva,
                    ID_Departamento,
                    ID_Inquilino,
                    Fecha_Ingreso,
                    Fecha_Salida,
                    Cantidad_Huespedes,
                    Estado,
                    Fecha_Creacion
                FROM res.Reserva";

            using var command = new SqlCommand(query, connection);

            connection.Open();

            using var reader = command.ExecuteReader();

            while (reader.Read())
            {
                lista.Add(new Reserva
                {
                    ID_Reserva = Convert.ToInt32(reader["ID_Reserva"]),
                    ID_Departamento = Convert.ToInt32(reader["ID_Departamento"]),
                    ID_Inquilino = Convert.ToInt32(reader["ID_Inquilino"]),
                    Fecha_Ingreso = Convert.ToDateTime(reader["Fecha_Ingreso"]),
                    Fecha_Salida = Convert.ToDateTime(reader["Fecha_Salida"]),
                    Cantidad_Huespedes =
                        Convert.ToInt32(reader["Cantidad_Huespedes"]),
                    Estado = reader["Estado"].ToString()!,
                    Fecha_Creacion =
                        Convert.ToDateTime(reader["Fecha_Creacion"])
                });
            }

            return lista;
        }

        public Reserva? Obtener(int id)
        {
            using var connection = _conexion.ObtenerConexion();

            string query = @"
                SELECT
                    ID_Reserva,
                    ID_Departamento,
                    ID_Inquilino,
                    Fecha_Ingreso,
                    Fecha_Salida,
                    Cantidad_Huespedes,
                    Estado,
                    Fecha_Creacion
                FROM res.Reserva
                WHERE ID_Reserva = @ID_Reserva";

            using var command = new SqlCommand(query, connection);

            command.Parameters.AddWithValue("@ID_Reserva", id);

            connection.Open();

            using var reader = command.ExecuteReader();

            if (!reader.Read())
                return null;

            return new Reserva
            {
                ID_Reserva = Convert.ToInt32(reader["ID_Reserva"]),
                ID_Departamento = Convert.ToInt32(reader["ID_Departamento"]),
                ID_Inquilino = Convert.ToInt32(reader["ID_Inquilino"]),
                Fecha_Ingreso = Convert.ToDateTime(reader["Fecha_Ingreso"]),
                Fecha_Salida = Convert.ToDateTime(reader["Fecha_Salida"]),
                Cantidad_Huespedes =
                    Convert.ToInt32(reader["Cantidad_Huespedes"]),
                Estado = reader["Estado"].ToString()!,
                Fecha_Creacion =
                    Convert.ToDateTime(reader["Fecha_Creacion"])
            };
        }

        public void Registrar(CrearReservaDTO reserva)
        {
            using var connection = _conexion.ObtenerConexion();

            string query = @"
                INSERT INTO res.Reserva
                (
                    ID_Departamento,
                    ID_Inquilino,
                    Fecha_Ingreso,
                    Fecha_Salida,
                    Cantidad_Huespedes,
                    Estado
                )
                VALUES
                (
                    @ID_Departamento,
                    @ID_Inquilino,
                    @Fecha_Ingreso,
                    @Fecha_Salida,
                    @Cantidad_Huespedes,
                    'Pendiente'
                )";

            using var command = new SqlCommand(query, connection);

            command.Parameters.AddWithValue(
                "@ID_Departamento",
                reserva.ID_Departamento);

            command.Parameters.AddWithValue(
                "@ID_Inquilino",
                reserva.ID_Inquilino);

            command.Parameters.AddWithValue(
                "@Fecha_Ingreso",
                reserva.Fecha_Ingreso);

            command.Parameters.AddWithValue(
                "@Fecha_Salida",
                reserva.Fecha_Salida);

            command.Parameters.AddWithValue(
                "@Cantidad_Huespedes",
                reserva.Cantidad_Huespedes);

            connection.Open();

            command.ExecuteNonQuery();
        }

        public void Actualizar(int id, ActualizarReservaDTO reserva)
        {
            using var connection = _conexion.ObtenerConexion();

            string query = @"
                UPDATE res.Reserva
                SET
                    Fecha_Ingreso = @Fecha_Ingreso,
                    Fecha_Salida = @Fecha_Salida,
                    Cantidad_Huespedes = @Cantidad_Huespedes,
                    Estado = @Estado
                WHERE ID_Reserva = @ID_Reserva";

            using var command = new SqlCommand(query, connection);

            command.Parameters.AddWithValue("@ID_Reserva", id);

            command.Parameters.AddWithValue(
                "@Fecha_Ingreso",
                reserva.Fecha_Ingreso);

            command.Parameters.AddWithValue(
                "@Fecha_Salida",
                reserva.Fecha_Salida);

            command.Parameters.AddWithValue(
                "@Cantidad_Huespedes",
                reserva.Cantidad_Huespedes);

            command.Parameters.AddWithValue(
                "@Estado",
                reserva.Estado);

            connection.Open();

            command.ExecuteNonQuery();
        }

        public void Eliminar(int id)
        {
            using var connection = _conexion.ObtenerConexion();

            string query = @"
                DELETE FROM res.Reserva
                WHERE ID_Reserva = @ID_Reserva";

            using var command = new SqlCommand(query, connection);

            command.Parameters.AddWithValue("@ID_Reserva", id);

            connection.Open();

            command.ExecuteNonQuery();
        }
    }
}