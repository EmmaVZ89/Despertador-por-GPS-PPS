import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as mapboxgl from 'mapbox-gl';

export interface MapboxOutput {
  attribute: string;
  features: Feature[];
  query: [];
}

export interface Feature {
  center: number[];
  place_name: string;
}

@Injectable({
  providedIn: 'root',
})
export class MapboxService {
  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v12';

  constructor(private http: HttpClient) {
    mapboxgl.accessToken = environment.mapbox.accessToken;
  }

  search_word(query: string) {
    const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
    return this.http
      .get(
        url +
          query +
          '.json?types=address&access_token=' +
          environment.mapbox.accessToken
      )
      .pipe(
        map((res: MapboxOutput) => {
          // console.log(res.features);
          return res.features;
        })
      );
  }

  buildMap(lat, long) {
    if (!this.map) {
      this.map = new mapboxgl.Map({
        container: 'map-box',
        style: this.style,
        zoom: 14,
        center: [long, lat],
      });
      this.map.resize();
    }
  }

  resetMap() {
    this.map = null;
  }

  setOriginMarker(lat, long) {
    const marker1 = new mapboxgl.Marker()
      .setLngLat([long, lat])
      .addTo(this.map);
  }

  setDestinyMarker(lat, long) {
    const marker1 = new mapboxgl.Marker({ color: 'black', rotation: 45 })
      .setLngLat([long, lat])
      .addTo(this.map);
  }
}
