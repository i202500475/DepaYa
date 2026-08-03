using ms_usuarios.Models;

namespace ms_usuarios.Interfaces
{
    public interface IUsuarioRepository
    {
        List<Usuario> Listar();

        Usuario? Obtener(int id);

        void Registrar(Usuario usuario);

        void Actualizar(Usuario usuario);

        void Eliminar(int id);
    }
}