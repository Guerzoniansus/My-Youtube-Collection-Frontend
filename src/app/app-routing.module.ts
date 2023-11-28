import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HomePageComponent} from "./component/home/home-page/home-page.component";
import {RouterModule, Routes} from "@angular/router";
import {LoginComponent} from "./component/login/login.component";



const routes: Routes = [
  { path: "", redirectTo: "/home", pathMatch: "full"},
  { path: "home", component: HomePageComponent },
  { path: "search", component: HomePageComponent},
  { path: "add-video", component: HomePageComponent},
  { path: "login", component: LoginComponent },
  { path: "**", redirectTo: "/home", pathMatch: "full"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
