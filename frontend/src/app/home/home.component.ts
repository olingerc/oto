import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "my-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent {

  public appDescription = "";

  public apps: any[] = [
    {
      privilege: "toolsUser",
      description: "Useful tools for data manipulation and visualisation",
      url: "/tools",
      icon: "/assets/tools-home.png",
      title: "Tools"
    }
  ]

  constructor(
    private router: Router
  ) { }

  goTo(url: string) {
    this.router.navigateByUrl(url);
  }
}
