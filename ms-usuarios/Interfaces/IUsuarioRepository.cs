using ms_usuarios.DTOs;
using ms_usuarios.Models;

namespace ms_usuarios.Interfaces
{
    public interface IUsuarioRepository
    {
        List<Usuario> Listar();

        Usuario? Obtener(int id);

        void Registrar(CrearUsuarioDTO usuario);

        void Actualizar(int id, ActualizarUsuarioDTO usuario);

        void Eliminar(int id);
    }
}