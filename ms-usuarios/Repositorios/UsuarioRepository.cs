using Microsoft.Data.SqlClient;
using ms_usuarios.Data;
using ms_usuarios.Interfaces;
using ms_usuarios.Models;

namespace ms_usuarios.Repositorios
{
    public class UsuarioRepository : IUsuarioRepository
    {
        private readonly ConexionBD _conexionBD;

        public UsuarioRepository(ConexionBD conexionBD)
        {
            _conexionBD = conexionBD;
        }

        public List<Usuario> Listar()
        {
            throw new NotImplementedException();
        }

        public Usuario? Obtener(int id)
        {
            throw new NotImplementedException();
        }

        public void Registrar(Usuario usuario)
        {
            throw new NotImplementedException();
        }

        public void Actualizar(Usuario usuario)
        {
            throw new NotImplementedException();
        }

        public void Eliminar(int id)
        {
            throw new NotImplementedException();
        }
    }
}