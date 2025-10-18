import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services';
import { RegisterRequest } from './shared/models';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('01Blog');

  constructor(private authService: AuthService) {}

  protected testRegister(): void {
    const registerData: RegisterRequest = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
    };

    this.authService.register(registerData).subscribe({
      next(response) {
        console.log('✅ Registration successful!');
        console.log('   Token:', response.token.substring(0, 20) + '...');
        console.log('   Username:', response.username);
      },
      error(err) {
        console.error('❌ Registration failed:', err.message);
      },
    });
  }
}

// ### **Test 1: Register New User**

// **Expected output:**
// ```
// 📝 Testing registration...
// ✅ Registration successful!
//    Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
//    Username: testuser
//    Email: test@example.com
//    Role: USER

// 🔍 Checking state:
//    Is logged in? true
//    Current user: {token: '...', username: 'testuser', email: 'test@example.com', role: 'USER'}
// ```

// **Check localStorage:**
// - Press F12 → Application tab → Local Storage → http://localhost:4200
// - You should see:
//   - `auth_token`: (long JWT string)
//   - `current_user`: `{"token":"...","username":"testuser",...}`

// ---
