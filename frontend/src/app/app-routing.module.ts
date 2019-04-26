import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageComponent } from 'projects/sonic-core/src/lib/components/page/page.component';

const routes: Routes = [
  { path: "", component: PageComponent},
  { path: ":contentUrl", component: PageComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
