using Microsoft.Data.SqlClient;

namespace ms\_usuarios.Data
{
public class ConexionBD
{
private readonly IConfiguration \_configuration;

```
public ConexionBD(IConfiguration configuration)
{
    _configuration = configuration;
}

public SqlConnection ObtenerConexion()
{
    string connectionString =
        _configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException(
            "No se encontró la cadena de conexión DefaultConnection.");

    return new SqlConnection(connectionString);
}
```

}

}
