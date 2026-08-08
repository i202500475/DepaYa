using Microsoft.Data.SqlClient;
using ms_pagos.Data;
using ms_pagos.DTOs;
using ms_pagos.Interfaces;
using ms_pagos.Models;

namespace ms_pagos.Repositorios
{
    public class PagoRepository : IPagoRepository
    {
        private readonly ConexionBD _conexion;

        public PagoRepository(ConexionBD conexion)
        {
            _conexion = conexion;
        }

        public List<Transaccion> Listar()
        {
            var lista = new List<Transaccion>();

            using var connection = _conexion.ObtenerConexion();

            string query = @"
                SELECT
                    ID_Pago,
                    ID_Reserva,
                    Monto_Total,
                    Moneda,
                    Metodo_Pago,
                    Estado_Pago,
                    Fecha_Transaccion,
                    Pasarela_Transaccion_ID
                FROM pag.Transaccion";

            using var command = new SqlCommand(query, connection);

            connection.Open();

            using var reader = command.ExecuteReader();

            while (reader.Read())
            {
                lista.Add(new Transaccion
                {
                    ID_Pago = Convert.ToInt32(reader["ID_Pago"]),
                    ID_Reserva = Convert.ToInt32(reader["ID_Reserva"]),
                    Monto_Total = Convert.ToDecimal(reader["Monto_Total"]),
                    Moneda = reader["Moneda"].ToString()!,
                    Metodo_Pago = reader["Metodo_Pago"].ToString()!,
                    Estado_Pago = reader["Estado_Pago"].ToString()!,
                    Fecha_Transaccion = Convert.ToDateTime(reader["Fecha_Transaccion"]),
                    Pasarela_Transaccion_ID =
                        reader["Pasarela_Transaccion_ID"] == DBNull.Value
                            ? null
                            : reader["Pasarela_Transaccion_ID"].ToString()
                });
            }

            return lista;
        }

        public Transaccion? Obtener(int id)
        {
            using var connection = _conexion.ObtenerConexion();

            string query = @"
                SELECT
                    ID_Pago,
                    ID_Reserva,
                    Monto_Total,
                    Moneda,
                    Metodo_Pago,
                    Estado_Pago,
                    Fecha_Transaccion,
                    Pasarela_Transaccion_ID
                FROM pag.Transaccion
                WHERE ID_Pago = @ID_Pago";

            using var command = new SqlCommand(query, connection);

            command.Parameters.AddWithValue("@ID_Pago", id);

            connection.Open();

            using var reader = command.ExecuteReader();

            if (!reader.Read())
                return null;

            return new Transaccion
            {
                ID_Pago = Convert.ToInt32(reader["ID_Pago"]),
                ID_Reserva = Convert.ToInt32(reader["ID_Reserva"]),
                Monto_Total = Convert.ToDecimal(reader["Monto_Total"]),
                Moneda = reader["Moneda"].ToString()!,
                Metodo_Pago = reader["Metodo_Pago"].ToString()!,
                Estado_Pago = reader["Estado_Pago"].ToString()!,
                Fecha_Transaccion = Convert.ToDateTime(reader["Fecha_Transaccion"]),
                Pasarela_Transaccion_ID =
                    reader["Pasarela_Transaccion_ID"] == DBNull.Value
                        ? null
                        : reader["Pasarela_Transaccion_ID"].ToString()
            };
        }

        public void Registrar(CrearPagoDTO pago)
        {
            using var connection = _conexion.ObtenerConexion();

            string query = @"
                INSERT INTO pag.Transaccion
                (
                    ID_Reserva,
                    Monto_Total,
                    Moneda,
                    Metodo_Pago,
                    Estado_Pago,
                    Pasarela_Transaccion_ID
                )
                VALUES
                (
                    @ID_Reserva,
                    @Monto_Total,
                    @Moneda,
                    @Metodo_Pago,
                    'Procesando',
                    @Pasarela_Transaccion_ID
                )";

            using var command = new SqlCommand(query, connection);

            command.Parameters.AddWithValue("@ID_Reserva", pago.ID_Reserva);
            command.Parameters.AddWithValue("@Monto_Total", pago.Monto_Total);
            command.Parameters.AddWithValue("@Moneda", pago.Moneda);
            command.Parameters.AddWithValue("@Metodo_Pago", pago.Metodo_Pago);
            command.Parameters.AddWithValue(
                "@Pasarela_Transaccion_ID",
                pago.Pasarela_Transaccion_ID ?? (object)DBNull.Value);

            connection.Open();

            command.ExecuteNonQuery();
        }

        public void Actualizar(int id, ActualizarPagoDTO pago)
        {
            using var connection = _conexion.ObtenerConexion();

            string query = @"
                UPDATE pag.Transaccion
                SET
                    Estado_Pago = @Estado_Pago,
                    Pasarela_Transaccion_ID = @Pasarela_Transaccion_ID
                WHERE ID_Pago = @ID_Pago";

            using var command = new SqlCommand(query, connection);

            command.Parameters.AddWithValue("@ID_Pago", id);
            command.Parameters.AddWithValue("@Estado_Pago", pago.Estado_Pago);
            command.Parameters.AddWithValue(
                "@Pasarela_Transaccion_ID",
                pago.Pasarela_Transaccion_ID ?? (object)DBNull.Value);

            connection.Open();

            command.ExecuteNonQuery();
        }

        public void Eliminar(int id)
        {
            using var connection = _conexion.ObtenerConexion();

            string query = @"
                DELETE FROM pag.Transaccion
                WHERE ID_Pago = @ID_Pago";

            using var command = new SqlCommand(query, connection);

            command.Parameters.AddWithValue("@ID_Pago", id);

            connection.Open();

            command.ExecuteNonQuery();
        }
    }
}