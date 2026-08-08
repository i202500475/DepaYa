using ms_auth.DTOs;

namespace ms_auth.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDTO?> AutenticarAsync(Guid azureObjectId);
    }
}