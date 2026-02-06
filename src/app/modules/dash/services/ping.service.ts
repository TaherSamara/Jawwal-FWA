import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface PingResponse {
  host: string;
  raw_output: string;
  error: string;
}

@Injectable({
  providedIn: 'root',
})
export class PingService {
  constructor(private http: HttpClient) {}

  ping(ip: string): Observable<PingResponse> {
    let params = new HttpParams();
    params = params.set('ip', ip);

    return this.http.get<PingResponse>('https://localhost:5000/api/ping', {
      params,
    });
  }
}
