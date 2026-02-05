import { HostListener, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PublicService {

    public onlineStatus: Subject<boolean> = new Subject<boolean>();
    public numOfRows: any;
    @HostListener('window:resize', ['$event'])
    onResize() {
        this.getWindowDimensions();
    }

    constructor() {
        this.getWindowDimensions();
        this.onlineStatus.next(navigator.onLine);
        window.addEventListener('online', () => {
            this.onlineStatus.next(true);
        });

        window.addEventListener('offline', () => {
            this.onlineStatus.next(false);
        });
    }

    private getWindowDimensions() {
        this.numOfRows = Math.floor((window.innerHeight - 260) / 59);
    }
}