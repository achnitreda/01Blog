import { Injectable } from "@angular/core";
import { AuthResponse, RegisterRequest } from "../../shared/models";
import { Observable, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn : 'root'
})

export class AuthService {
    constructor(private http : HttpClient){
        console.log("🔐 AuthService initialized")
    }

    // ============================================
    // AUTHENTICATION METHODS
    // ============================================

    /**
     * Register new user
    */
    register(data: RegisterRequest): Observable<AuthResponse> {
        console.log('-> Registering user:', data.username);
        return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data)
            .pipe(
                tap(response => {
                    console.log('-> Registration successful:', response.username);
                    this.handleAuthSuccess(response);
                }),
            );
    }


    // ============================================
    // PRIVATE HELPER METHODS
    // ============================================

    /**
     * Handle successful authentication
    */
    private handleAuthSuccess(response: AuthResponse): void {
        console.log("-> handleAuthSuccess...");
    }
}