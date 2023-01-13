import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoadingController, ToastController } from '@ionic/angular';
import * as moment from 'moment';

import { Geolocation } from '@capacitor/geolocation';

import { MapboxService, Feature } from '../services/mapbox.service';

import {
  NativeGeocoder,
  NativeGeocoderResult,
  NativeGeocoderOptions,
} from '@awesome-cordova-plugins/native-geocoder/ngx';
import { features } from 'process';
import { AlarmService } from '../services/alarm.service';

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

  flagCurrentAddress: boolean = false;
  flagDestinationAddress: boolean = false;

  idIntervalAlarm: any;
  alarmActivated: boolean = false;
  firstAlarmActivation: boolean = false;

  alarmSound: any = new Audio('../../assets/alarma1.mp3');

  loading: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private nativeGeocoder: NativeGeocoder,
    private mapboxService: MapboxService,
    private LoadingController: LoadingController,
    private alarmService: AlarmService
  ) {}

  ngOnInit(): void {
    setTimeout(async () => {
      await this.showLoading('');
      this.loading.present();
    }, 0);
    this.authService.user$.subscribe((user: any) => {
      this.loading.dismiss();
      if (user) {
        // console.log(user);
        this.user = user;
        this.printCurrentPosition();
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
      this.flagDestinationAddress = true;
    });
    this.addresses = [];
  }

  async printCurrentPosition() {
    await this.showLoading("Cargardo ubicación...");
    this.loading.present();
    const coordinates = await Geolocation.getCurrentPosition();
    this.currentLatitude = coordinates.coords.latitude;
    this.currentLongitude = coordinates.coords.longitude;

    const options: NativeGeocoderOptions = {
      maxResults: 1,
      useLocale: false,
    };
    this.nativeGeocoder
      .reverseGeocode(this.currentLatitude, this.currentLongitude, options)
      .then((results: NativeGeocoderResult[]) => {
        this.loading.dismiss();
        this.results = results[0];
        this.keys = Object.keys(this.results);
        this.flagCurrentAddress = true;
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

  activateAlarm() {
    this.createAlarm();
    this.alarmActivated = true;
    this.idIntervalAlarm = setInterval(() => {
      this.onSelect(this.selectedAddress);
      if (
        this.currentDistance <= this.minimunDistance &&
        !this.firstAlarmActivation
      ) {
        this.firstAlarmActivation = true;
        this.alarmSound.loop = true;
        this.alarmSound.play();
      }
    }, 1000);
  }

  desactivateAlarm() {
    clearInterval(this.idIntervalAlarm);
    this.alarmSound.loop = false;
    this.alarmSound.pause();
    this.alarmSound.currentTime = 0;
    this.reset();
  }

  reset() {
    this.firstAlarmActivation = false;
    this.alarmActivated = false;
    this.flagCurrentAddress = false;
    this.flagDestinationAddress = false;
    this.minimunDistance = 0;
    this.printCurrentPosition();
  }

  createAlarm() {
    const date = moment(new Date()).format('DD-MM-YYYY HH:mm:ss');
    const origin = `${this.results.thoroughfare} ${this.results.subThoroughfare}, ${this.results.subLocality}, ${this.results.administrativeArea}, ${this.results.postalCode}, ${this.results.countryName}`;
    const destiny = this.selectedAddress;
    const coorOrigin = {
      latitude: this.currentLatitude,
      logitude: this.currentLongitude,
    };
    const coorDestiny = { latitude: this.latitude, longitude: this.longitude };
    const alarm: any = {
      userUid: this.user.userUid,
      date: date,
      origin: origin,
      destiny: destiny,
      coorOrigin: coorOrigin,
      coorDestiny: coorDestiny,
      minimumDistance: this.minimunDistance,
      initialDistance: this.currentDistance
    };
    this.alarmService.createAlarm(alarm);
  }

  async showLoading(message: string) {
    try {
      this.loading = await this.LoadingController.create({
        message: message,
        spinner: 'crescent',
        showBackdrop: true,
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  showSpinner() {
    this.pressedButton = true;
    setTimeout(() => {
      this.pressedButton = false;
    }, 2000);
  } // end of showSpinner
}
