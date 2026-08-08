using ms_auth.DTOs;
using ms_auth.Interfaces;

namespace ms_auth.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;

        public AuthService(IAuthRepository authRepository)
        {
            _authRepository = authRepository;
        }

        public async Task<AuthResponseDTO?> AutenticarAsync(Guid azureObjectId)
        {
            return await _authRepository.AutenticarAsync(azureObjectId);
        }
    }
}