import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashComponent } from './dash.component';
import { StationDetailsComponent } from './pages/station-details/station-details.component';
import { StationsComponent } from './pages/stations/stations.component';

const routes: Routes = [
  {
    path: '',
    component: DashComponent,
    children: [
      {
        path: 'stations',
        component: StationsComponent,
        title: 'Stations | FWA Stations',
      },
      {
        path: 'station-details/:name',
        component: StationDetailsComponent,
        title: 'Station Details | FWA Stations',
      },
      {
        path: '',
        redirectTo: 'stations',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashRoutingModule {}
