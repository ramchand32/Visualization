import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VaasHistoryComponent } from './vaas-history/vaas-history.component';
import { VaasHomeComponent } from './vaas-home/vaas-home.component';

const routes: Routes = [
  { path: '', component: VaasHomeComponent },
  { path: 'VisHistory', component: VaasHistoryComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
