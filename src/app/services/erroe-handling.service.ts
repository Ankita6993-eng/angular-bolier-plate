// // import { Injectable,ErrorHandler,Injector } from '@angular/core';
// import { HttpInterceptor, HttpEvent, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { Injectable } from '@angular/core';
// import { catchError } from 'rxjs/operators';
// import { Router } from "@angular/router";


// @Injectable({
//   providedIn: 'root'
// })
// export class ErroeHandlingService implements HttpInterceptor  {

//   constructor(public router: Router) { }

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     return next.handle(req).pipe(
//       catchError((err: HttpErrorResponse) => {
//         console.log('err.status', err.status);
//         if (err.status === 401) { 
//           localStorage.clear()
//           //this.router.navigate(['/login'], { queryParams: { returnUrl: req.url } });
//           this.router.navigate(['/login']);
//         }
//         return throwError(err);
//       })
//     );
//   }
// }
