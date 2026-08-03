using ms_usuarios.DTOs;

namespace ms_usuarios.Interfaces
{
    public interface IUsuarioService
    {
        List<UsuarioDTO> Listar();

        UsuarioDTO? Obtener(int id);

        void Registrar(CrearUsuarioDTO usuario);

        void Actualizar(int id, ActualizarUsuarioDTO usuario);

        void Eliminar(int id);
    }
}