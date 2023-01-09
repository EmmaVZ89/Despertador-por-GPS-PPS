import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.auth.getUserLogged().subscribe((res) => {
      if (res !== null) {
        this.router.navigate(['/home']);
      }
    });
  }

  loginUser() {
    if (this.email && this.password) {
      this.auth.signIn(this.email, this.password);
    } else {
      this.auth.toast('¡Por favor completa todos los campos!', 'warning');
    }
  } // end of loginUser

  loadFastUser(numUser: number) {
    switch (numUser) {
      case 1:
        this.email = 'admin@admin.com';
        this.password = '111111';
        this.auth.toast(
          '¡Usuario cargado, ahora puedes Iniciar Sesión!',
          'light'
        );
        break;
      case 2:
        this.email = 'invitado@invitado.com';
        this.password = '222222';
        this.auth.toast(
          '¡Usuario cargado, ahora puedes Iniciar Sesión!',
          'light'
        );
        break;
      case 3:
        this.email = 'usuario@usuario.com';
        this.password = '333333';
        this.auth.toast(
          '¡Usuario cargado, ahora puedes Iniciar Sesión!',
          'light'
        );
        break;
      default:
        break;
    }
  } // end of loadFastUser
}
