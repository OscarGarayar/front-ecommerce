import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Storage, StorageKeys } from '../util/storage';

export type SessionState = {
  token: string | null;
  role: string | null;
};

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly _state$ = new BehaviorSubject<SessionState>({
    token: Storage.get(StorageKeys.token),
    role: Storage.get(StorageKeys.role),
  });

  readonly state$ = this._state$.asObservable();

  get snapshot(): SessionState {
    return this._state$.value;
  }

  setSession(token: string, role: string) {
    Storage.set(StorageKeys.token, token);
    Storage.set(StorageKeys.role, role);
    this._state$.next({ token, role });
  }

  clearSession() {
    Storage.remove(StorageKeys.token);
    Storage.remove(StorageKeys.role);
    this._state$.next({ token: null, role: null });
  }
}
