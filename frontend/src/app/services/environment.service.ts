import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class EnvironmentService {
  // Return backend URL for socket client.
  // Keep API_BASE_URL support and use the configured dev backend port as-is.
  getBackendUrl(): string {
    const configured = (window as any).API_BASE_URL || 'http://localhost:3000';

    return configured;
  }
}
