import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import * as moment from 'moment';

import { Geolocation } from '@capacitor/geolocation';

import { MapboxService, Feature } from '../services/mapbox.service';

import {
  NativeGeocoder,
  NativeGeocoderResult,
  NativeGeocoderOptions,
} from '@awesome-cordova-plugins/native-geocoder/ngx';
import { features } from 'process';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  user: any = null;
  pressedButton: boolean = false;

  addresses: string[] = [];
  selectedAddress = null;
  latitude: number = 0;
  longitude: number = 0;

  currentLatitude: number = 0;
  currentLongitude: number = 0;
  results: NativeGeocoderResult;
  keys: string[] = [];

  minimunDistance: number;
  currentDistance: number;

  constructor(
    private authService: AuthService,
    private router: Router,
    private nativeGeocoder: NativeGeocoder,
    private mapboxService: MapboxService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user: any) => {
      if (user) {
        this.user = user;
        this.printCurrentPosition();
        // this.calcularDistanciaEntreDosCoordenadas();
      }
    });
  } // end of ngOnInit

  logoutUser() {
    this.authService.signOut();
  } // end of logoutUser

  search(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    if (searchTerm && searchTerm.length > 0) {
      this.mapboxService
        .search_word(searchTerm)
        .subscribe((features: Feature[]) => {
          console.log(features);
          this.addresses = features.map((feat) => feat.place_name);
        });
    } else {
      this.addresses = [];
    }
  }

  onSelect(address: string) {
    this.selectedAddress = address;
    this.mapboxService.search_word(address).subscribe((features: Feature[]) => {
      this.latitude = features[0].center[1];
      this.longitude = features[0].center[0];
      this.currentDistance = Math.round(
        this.calculateDistanceBetweenTwoCoordinates(
          this.currentLatitude,
          this.currentLongitude,
          this.latitude,
          this.longitude
        ) * 1000
      );
      // console.log("Distancia = ", Math.round(this.currentDistance*1000), " mts");
      // console.log(this.selectedAddress, ' ', this.latitude, ' ', this.longitude);
    });
    this.addresses = [];
  }

  async printCurrentPosition() {
    const coordinates = await Geolocation.getCurrentPosition();
    // console.log('Current position:', coordinates);
    this.currentLatitude = coordinates.coords.latitude;
    this.currentLongitude = coordinates.coords.longitude;

    const options: NativeGeocoderOptions = {
      maxResults: 1,
      useLocale: false,
    };
    this.nativeGeocoder
      .reverseGeocode(this.currentLatitude, this.currentLongitude, options)
      .then((results: NativeGeocoderResult[]) => {
        this.results = results[0];
        this.keys = Object.keys(this.results);
      });
  }

  calculateDistanceBetweenTwoCoordinates(lat1, lon1, lat2, lon2) {
    // Convertir todas las coordenadas a radianes
    lat1 = this.degreesToRadians(lat1);
    lon1 = this.degreesToRadians(lon1);
    lat2 = this.degreesToRadians(lat2);
    lon2 = this.degreesToRadians(lon2);
    // Aplicar fórmula
    const RADIO_TIERRA_EN_KILOMETROS = 6371;
    let diferenciaEntreLongitudes = lon2 - lon1;
    let diferenciaEntreLatitudes = lat2 - lat1;
    let a =
      Math.pow(Math.sin(diferenciaEntreLatitudes / 2.0), 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.pow(Math.sin(diferenciaEntreLongitudes / 2.0), 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return RADIO_TIERRA_EN_KILOMETROS * c;
  }

  degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  showSpinner() {
    this.pressedButton = true;
    setTimeout(() => {
      this.pressedButton = false;
    }, 2000);
  } // end of showSpinner
}
