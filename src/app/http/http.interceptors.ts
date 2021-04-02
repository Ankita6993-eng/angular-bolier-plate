import { Injectable } from '@angular/core';
import { Observable,throwError } from 'rxjs';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpHeaders, HttpResponse,HttpErrorResponse } from '@angular/common/http';
import { Router } from "@angular/router";
import { environment } from '../../environments/environment';
import { StorageService } from '../services/storage.service';
import { catchError } from 'rxjs/operators';


@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  constructor(public router: Router) { }
  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const headersObj: any = {
      Accept: 'application/json'
    };

    let url = environment.apiUrl + req.url;

      const accessToken = StorageService.getData('token');
      //console.log('accessToken', accessToken);
      
      if (accessToken) {
        headersObj.Authorization = `Bearer ${accessToken}`;
      }
        req=req.clone({ url,headers: new HttpHeaders(headersObj)})
          return next.handle(req).pipe(
            catchError((err: HttpErrorResponse) => {
              console.log('err.status', err);
              if (err.status === 401) { 
                localStorage.clear()
                this.router.navigate(['/login'], { queryParams: { returnUrl: req.url } });
              }

              return throwError(err);
            })
          );
    }
}
