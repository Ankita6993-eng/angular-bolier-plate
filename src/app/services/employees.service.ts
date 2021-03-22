import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface ResponseData {
  data: any,
  message: string,
  statusCode: number
}

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {

  constructor(
    private http: HttpClient
  ) { }

  addUser(data) {
    return this.http.post('/users/adduser', data);
  }

  updateUser(data, id: string) {
    return this.http.put(`/users/edituser/${id}`, data);
  }

  deleteUser(id: string) {
    return this.http.delete(`/country/${id}`);
  }

  getUser(data, page: number =1 , limit: number = 5) {
    return this.http.post(`/users/searchdata?page=${page}&perPage=${limit}`, data);
  }
  
}
