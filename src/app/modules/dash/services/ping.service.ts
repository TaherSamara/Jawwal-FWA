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

  /**
   * Ping a host with optional count parameter
   * @param host IP address or hostname
   * @param count Number of ping packets (default: 5)
   * @returns Observable of PingResponse
   */
  ping(host: string, count: number = 5): Observable<PingResponse> {
    let params = new HttpParams();
    params = params.set('host', host);
    params = params.set('count', count.toString());

    return this.http.get<PingResponse>('https://backend.nstechs.co/api/ping', {
      params,
    });
  }
}
