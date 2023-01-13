import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class AlarmService {
  constructor(private angularFirestore: AngularFirestore) {}

  createAlarm(alarm: any) {
    this.angularFirestore.collection<any>('alarmas').add(alarm);
  }

  getAlarms(uid) {
    const collection = this.angularFirestore.collection<any>('alarmas', (ref) =>
      ref.where('userUid', '==', uid)
    );
    return collection.valueChanges();
  }
}
