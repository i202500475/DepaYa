using ms_usuarios.DTOs;
using ms_usuarios.Interfaces;
using ms_usuarios.Models;

namespace ms_usuarios.Services
{
    public class UsuarioService : IUsuarioService
    {
        private readonly IUsuarioRepository _repository;

        public UsuarioService(IUsuarioRepository repository)
        {
            _repository = repository;
        }

        public List<UsuarioDTO> Listar()
        {
            var usuarios = _repository.Listar();

            return usuarios.Select(u => new UsuarioDTO
            {
                ID_Usuario = u.ID_Usuario,
                Azure_Object_ID = u.Azure_Object_ID,
                Nombre = u.Nombre,
                Apellido = u.Apellido,
                Tipo_Documento = u.Tipo_Documento,
                Numero_Documento = u.Numero_Documento,
                Correo = u.Correo,
                Telefono = u.Telefono,
                Rol = u.Rol,
                Fecha_Registro = u.Fecha_Registro
            }).ToList();
        }

        public UsuarioDTO? Obtener(int id)
        {
            var usuario = _repository.Obtener(id);

            if (usuario == null)
                return null;

            return new UsuarioDTO
            {
                ID_Usuario = usuario.ID_Usuario,
                Azure_Object_ID = usuario.Azure_Object_ID,
                Nombre = usuario.Nombre,
                Apellido = usuario.Apellido,
                Tipo_Documento = usuario.Tipo_Documento,
                Numero_Documento = usuario.Numero_Documento,
                Correo = usuario.Correo,
                Telefono = usuario.Telefono,
                Rol = usuario.Rol,
                Fecha_Registro = usuario.Fecha_Registro
            };
        }

        public void Registrar(CrearUsuarioDTO usuario)
        {
            _repository.Registrar(usuario);
        }

        public void Actualizar(int id, ActualizarUsuarioDTO usuario)
        {
            _repository.Actualizar(id, usuario);
        }

        public void Eliminar(int id)
        {
            _repository.Eliminar(id);
        }
    }
}