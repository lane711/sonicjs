import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PageBuilderComponent } from "src/app/page-builder/page-builder.component";

const routes: Routes = [
    { path: "**", component: PageBuilderComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: "reload" })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
export const routingComopnents = [PageBuilderComponent]
