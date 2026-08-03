using ms_usuarios.DTOs;
using ms_usuarios.Interfaces;
using ms_usuarios.Models;

namespace ms_usuarios.Services
{
    public class UsuarioService : IUsuarioService
    {
        private readonly IUsuarioRepository _usuarioRepository;

        public UsuarioService(IUsuarioRepository usuarioRepository)
        {
            _usuarioRepository = usuarioRepository;
        }

        public List<UsuarioDTO> Listar()
        {
            var usuarios = _usuarioRepository.Listar();

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
            var usuario = _usuarioRepository.Obtener(id);

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

        public void Registrar(CrearUsuarioDTO dto)
        {
            Usuario usuario = new Usuario
            {
                Nombre = dto.Nombre,
                Apellido = dto.Apellido,
                Tipo_Documento = dto.Tipo_Documento,
                Numero_Documento = dto.Numero_Documento,
                Correo = dto.Correo,
                Telefono = dto.Telefono,
                Rol = dto.Rol
            };

            _usuarioRepository.Registrar(usuario);
        }

        public void Actualizar(int id, ActualizarUsuarioDTO dto)
        {
            Usuario? usuario = _usuarioRepository.Obtener(id);

            if (usuario == null)
                throw new Exception("El usuario no existe.");

            usuario.Nombre = dto.Nombre;
            usuario.Apellido = dto.Apellido;
            usuario.Correo = dto.Correo;
            usuario.Telefono = dto.Telefono;

            _usuarioRepository.Actualizar(usuario);
        }

        public void Eliminar(int id)
        {
            _usuarioRepository.Eliminar(id);
        }
    }
}