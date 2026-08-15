import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  iD_Usuario: number;
  azure_Object_ID: string;
  nombre: string;
  apellido: string;
  tipo_Documento: string;
  numero_Documento: string;
  correo: string;
  telefono: string;
  rol: string;
  fecha_Registro: string;
}

export interface CrearUsuario {
  azure_Object_ID?: string;
  nombre: string;
  apellido: string;
  tipo_Documento: string;
  numero_Documento: string;
  correo: string;
  telefono: string;
  rol: string;
}

export interface ActualizarUsuario {
  nombre: string;
  apellido: string;
  tipo_Documento: string;
  numero_Documento: string;
  correo: string;
  telefono: string;
  rol: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = 'http://localhost:5154/api/Usuarios';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  obtener(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  registrar(usuario: CrearUsuario): Observable<any> {
    return this.http.post(this.apiUrl, usuario, {
      headers: this.getHeaders(),
    });
  }

  actualizar(id: number, usuario: ActualizarUsuario): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, usuario, {
      headers: this.getHeaders(),
    });
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
