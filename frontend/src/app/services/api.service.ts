import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ItemImageApiRow {
  id: string;
  name: string;
  image_url: string | null;
  modifiedOnServer?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  /**
   * Fetch all menu items with image URLs from database
   */
  getMenuItemsImages(): Observable<ItemImageApiRow[]> {
    return this.http.get<ItemImageApiRow[]>(`${this.apiUrl}/item-image`);
  }
}
