import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { sonicCore  } from 'sonicCore';
import { SonicCoreComponent } from 'node_modules/sonic-core/src/lib/sonic-core.component';
// import { SonicCoreComponent } from 'node_modules/sonic-core/';

const routes: Routes = [
  { path: "", component: SonicCoreComponent},
  { path: ":contentUrl", component: SonicCoreComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
