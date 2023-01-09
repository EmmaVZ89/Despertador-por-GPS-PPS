import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import * as moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  user: any = null;
  pressedButton: boolean = false;

  constructor(private authService: AuthService, private router: Router) {} // end of constructor

  ngOnInit(): void {
    this.authService.user$.subscribe((user: any) => {
      if (user) {
        this.user = user;
      }
      // else {
      //   this.router.navigate(['/login']);
      // }
    });
  } // end of ngOnInit

  logoutUser() {
    this.authService.signOut();
  } // end of logoutUser

  showSpinner() {
    this.pressedButton = true;
    setTimeout(() => {
      this.pressedButton = false;
    }, 2000);
  } // end of showSpinner
}
