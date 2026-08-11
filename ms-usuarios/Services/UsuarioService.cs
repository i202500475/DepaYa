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

        // =========================================================
        // LISTAR
        // =========================================================
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

        // =========================================================
        // OBTENER
        // =========================================================
        public UsuarioDTO? Obtener(int id)
        {
            var usuario = _repository.Obtener(id);

            if (usuario == null)
            {
                return null;
            }

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

        // =========================================================
        // REGISTRAR
        // =========================================================
        public void Registrar(CrearUsuarioDTO usuario)
        {
            _repository.Registrar(usuario);
        }

        // =========================================================
        // ACTUALIZAR
        // =========================================================
        public void Actualizar(int id, ActualizarUsuarioDTO usuario)
        {
            var existente = _repository.Obtener(id);

            if (existente == null)
            {
                throw new KeyNotFoundException(
                    "El usuario que intenta actualizar no existe."
                );
            }

            _repository.Actualizar(id, usuario);
        }

        // =========================================================
        // ELIMINAR
        // =========================================================
        public void Eliminar(int id)
        {
            var existente = _repository.Obtener(id);

            if (existente == null)
            {
                throw new KeyNotFoundException(
                    "El usuario que intenta eliminar no existe."
                );
            }

            _repository.Eliminar(id);
        }
    }
}