import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpHeaders, HttpResponse } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { StorageService } from '../services/storage.service';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const headersObj: any = {
      Accept: 'application/json'
    };

    let url = environment.apiUrl + req.url;

    // if (req.url[0] === '/') {
      // const endPoint = req.url.indexOf('/api/v1') > -1 ? environment.serverUrl : environment.apiEndpoint;
      // url = endPoint + req.url;
      const accessToken = StorageService.getData('token');
      //console.log('accessToken', accessToken);
      
      if (accessToken) {
        headersObj.Authorization = `Bearer ${accessToken}`;
      }
    // }

    return next.handle(req.clone({
      url,
      headers: new HttpHeaders(headersObj)
    }));
  }
}
