using ms_auth.DTOs;

namespace ms_auth.Interfaces
{
    public interface IAuthRepository
    {
        Task<AuthResponseDTO?> AutenticarAsync(Guid azureObjectId);
    }
}