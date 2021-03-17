import { ErrorHandler, Injectable, Injector } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class ErrorHandlingService implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error) {
    const router = this.injector.get(Router);
    console.log("router", router);

    if (error['status'] === 401) {
      localStorage.clear();
      router.navigate(['/login']);
    }
  }
}
