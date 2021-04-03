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

  addEmployee(data) {
    return this.http.post('/users/adduser', data);
  }

  updateEmployee(data, id: string) {
    return this.http.put(`/users/edituser/${id}`, data);
  }

  deleteEmployee(id: string) {
    return this.http.delete(`/country/${id}`);
  }

  getEmployees(data, page: number =1 , limit: number = 5) {
    return this.http.post(`/users/searchdata?page=${page}&perPage=${limit}`, data);
  }
  
}
