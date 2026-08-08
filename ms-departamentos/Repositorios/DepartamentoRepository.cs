using Microsoft.Data.SqlClient;
using ms_departamentos.Data;
using ms_departamentos.DTOs;
using ms_departamentos.Interfaces;

namespace ms_departamentos.Repositorios
{
    public class DepartamentoRepository : IDepartamentoRepository
    {
        private readonly ConexionBD _conexionBD;

        public DepartamentoRepository(ConexionBD conexionBD)
        {
            _conexionBD = conexionBD;
        }

        public async Task<IEnumerable<DepartamentoDTO>> ListarAsync()
        {
            var departamentos = new List<DepartamentoDTO>();

            using SqlConnection conexion = _conexionBD.ObtenerConexion();

            await conexion.OpenAsync();

            using SqlCommand comando = new SqlCommand(
                "dep.sp_ListarDepartamentosDisponibles",
                conexion);

            comando.CommandType = System.Data.CommandType.StoredProcedure;

            using SqlDataReader reader = await comando.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                departamentos.Add(new DepartamentoDTO
                {
                    ID_Departamento = reader.GetInt32(
                        reader.GetOrdinal("ID_Departamento")),

                    Titulo = reader.GetString(
                        reader.GetOrdinal("Titulo")),

                    Descripcion = reader.GetString(
                        reader.GetOrdinal("Descripcion")),

                    Distrito = reader.GetString(
                        reader.GetOrdinal("Distrito")),

                    Direccion = reader.GetString(
                        reader.GetOrdinal("Direccion")),

                    Precio_Noche = reader.GetDecimal(
                        reader.GetOrdinal("Precio_Noche")),

                    Capacidad_Personas = reader.GetInt32(
                        reader.GetOrdinal("Capacidad_Personas")),

                    Habitaciones = reader.GetInt32(
                        reader.GetOrdinal("Habitaciones")),

                    Banos = reader.GetInt32(
                        reader.GetOrdinal("Banos"))
                });
            }

            return departamentos;
        }

        public async Task<DepartamentoDTO?> ObtenerAsync(int id)
        {
            using SqlConnection conexion = _conexionBD.ObtenerConexion();

            await conexion.OpenAsync();

            string sql = @"
                SELECT
                    ID_Departamento,
                    ID_Propietario,
                    Titulo,
                    Descripcion,
                    Distrito,
                    Direccion,
                    Latitud,
                    Longitud,
                    Precio_Noche,
                    Capacidad_Personas,
                    Habitaciones,
                    Banos,
                    Estado
                FROM dep.Departamento
                WHERE ID_Departamento = @ID_Departamento";

            using SqlCommand comando = new SqlCommand(sql, conexion);

            comando.Parameters.AddWithValue("@ID_Departamento", id);

            using SqlDataReader reader = await comando.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                return MapearDepartamento(reader);
            }

            return null;
        }

        public async Task<DepartamentoDTO> RegistrarAsync(
            CrearDepartamentoDTO dto)
        {
            using SqlConnection conexion = _conexionBD.ObtenerConexion();

            await conexion.OpenAsync();

            string sql = @"
                INSERT INTO dep.Departamento
                (
                    ID_Propietario,
                    Titulo,
                    Descripcion,
                    Distrito,
                    Direccion,
                    Latitud,
                    Longitud,
                    Precio_Noche,
                    Capacidad_Personas,
                    Habitaciones,
                    Banos,
                    Estado
                )
                VALUES
                (
                    @ID_Propietario,
                    @Titulo,
                    @Descripcion,
                    @Distrito,
                    @Direccion,
                    @Latitud,
                    @Longitud,
                    @Precio_Noche,
                    @Capacidad_Personas,
                    @Habitaciones,
                    @Banos,
                    @Estado
                );

                SELECT SCOPE_IDENTITY();";

            using SqlCommand comando = new SqlCommand(sql, conexion);

            comando.Parameters.AddWithValue("@ID_Propietario", dto.ID_Propietario);
            comando.Parameters.AddWithValue("@Titulo", dto.Titulo);
            comando.Parameters.AddWithValue("@Descripcion", dto.Descripcion);
            comando.Parameters.AddWithValue("@Distrito", dto.Distrito);
            comando.Parameters.AddWithValue("@Direccion", dto.Direccion);
            comando.Parameters.AddWithValue("@Latitud", dto.Latitud ?? (object)DBNull.Value);
            comando.Parameters.AddWithValue("@Longitud", dto.Longitud ?? (object)DBNull.Value);
            comando.Parameters.AddWithValue("@Precio_Noche", dto.Precio_Noche);
            comando.Parameters.AddWithValue("@Capacidad_Personas", dto.Capacidad_Personas);
            comando.Parameters.AddWithValue("@Habitaciones", dto.Habitaciones);
            comando.Parameters.AddWithValue("@Banos", dto.Banos);
            comando.Parameters.AddWithValue("@Estado", dto.Estado);

            int idGenerado = Convert.ToInt32(await comando.ExecuteScalarAsync());

            return (await ObtenerAsync(idGenerado))!;
        }

        public async Task<DepartamentoDTO?> ActualizarAsync(
            int id,
            ActualizarDepartamentoDTO dto)
        {
            using SqlConnection conexion = _conexionBD.ObtenerConexion();

            await conexion.OpenAsync();

            string sql = @"
                UPDATE dep.Departamento
                SET
                    Titulo = @Titulo,
                    Descripcion = @Descripcion,
                    Distrito = @Distrito,
                    Direccion = @Direccion,
                    Latitud = @Latitud,
                    Longitud = @Longitud,
                    Precio_Noche = @Precio_Noche,
                    Capacidad_Personas = @Capacidad_Personas,
                    Habitaciones = @Habitaciones,
                    Banos = @Banos,
                    Estado = @Estado
                WHERE ID_Departamento = @ID_Departamento";

            using SqlCommand comando = new SqlCommand(sql, conexion);

            comando.Parameters.AddWithValue("@ID_Departamento", id);
            comando.Parameters.AddWithValue("@Titulo", dto.Titulo);
            comando.Parameters.AddWithValue("@Descripcion", dto.Descripcion);
            comando.Parameters.AddWithValue("@Distrito", dto.Distrito);
            comando.Parameters.AddWithValue("@Direccion", dto.Direccion);
            comando.Parameters.AddWithValue("@Latitud", dto.Latitud ?? (object)DBNull.Value);
            comando.Parameters.AddWithValue("@Longitud", dto.Longitud ?? (object)DBNull.Value);
            comando.Parameters.AddWithValue("@Precio_Noche", dto.Precio_Noche);
            comando.Parameters.AddWithValue("@Capacidad_Personas", dto.Capacidad_Personas);
            comando.Parameters.AddWithValue("@Habitaciones", dto.Habitaciones);
            comando.Parameters.AddWithValue("@Banos", dto.Banos);
            comando.Parameters.AddWithValue("@Estado", dto.Estado);

            int filas = await comando.ExecuteNonQueryAsync();

            if (filas == 0)
            {
                return null;
            }

            return await ObtenerAsync(id);
        }

        public async Task<bool> EliminarAsync(int id)
        {
            using SqlConnection conexion = _conexionBD.ObtenerConexion();

            await conexion.OpenAsync();

            string sql = @"
                DELETE FROM dep.Departamento
                WHERE ID_Departamento = @ID_Departamento";

            using SqlCommand comando = new SqlCommand(sql, conexion);

            comando.Parameters.AddWithValue("@ID_Departamento", id);

            int filas = await comando.ExecuteNonQueryAsync();

            return filas > 0;
        }

        private DepartamentoDTO MapearDepartamento(SqlDataReader reader)
        {
            return new DepartamentoDTO
            {
                ID_Departamento = reader.GetInt32(
                    reader.GetOrdinal("ID_Departamento")),

                ID_Propietario = reader.GetInt32(
                    reader.GetOrdinal("ID_Propietario")),

                Titulo = reader.GetString(
                    reader.GetOrdinal("Titulo")),

                Descripcion = reader.GetString(
                    reader.GetOrdinal("Descripcion")),

                Distrito = reader.GetString(
                    reader.GetOrdinal("Distrito")),

                Direccion = reader.GetString(
                    reader.GetOrdinal("Direccion")),

                Latitud = reader.IsDBNull(
                    reader.GetOrdinal("Latitud"))
                    ? null
                    : reader.GetDecimal(reader.GetOrdinal("Latitud")),

                Longitud = reader.IsDBNull(
                    reader.GetOrdinal("Longitud"))
                    ? null
                    : reader.GetDecimal(reader.GetOrdinal("Longitud")),

                Precio_Noche = reader.GetDecimal(
                    reader.GetOrdinal("Precio_Noche")),

                Capacidad_Personas = reader.GetInt32(
                    reader.GetOrdinal("Capacidad_Personas")),

                Habitaciones = reader.GetInt32(
                    reader.GetOrdinal("Habitaciones")),

                Banos = reader.GetInt32(
                    reader.GetOrdinal("Banos")),

                Estado = reader.GetString(
                    reader.GetOrdinal("Estado"))
            };
        }
    }
}
