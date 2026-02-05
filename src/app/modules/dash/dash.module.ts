import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { DeleteConfirmationModalComponent } from './components/delete-confirmation-modal/delete-confirmation-modal.component';
import { StationModalComponent } from './components/station-modal/station-modal.component';
import { SubscriberModalComponent } from './components/subscriber-modal/subscriber-modal.component';
import { DashRoutingModule } from './dash-routing.module';
import { DashComponent } from './dash.component';
import { StationDetailsComponent } from './pages/station-details/station-details.component';
import { StationsComponent } from './pages/stations/stations.component';
import { PingComponent } from './components/ping/ping.component';

@NgModule({
  declarations: [
    DashComponent,
    StationsComponent,
    StationDetailsComponent,
    SubscriberModalComponent,
    StationModalComponent,
    PingComponent,
    DeleteConfirmationModalComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    DashRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    InlineSVGModule,
    GoogleMapsModule,
    AngularFirestoreModule,
  ],
  providers: [],
})
export class DashModule {}
