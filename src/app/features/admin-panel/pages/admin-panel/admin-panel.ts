import { Component, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Header } from '../../components/header/header';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Footer } from '../../components/footer/footer';


@Component({
  selector: 'page-admin-panel',
  imports: [RouterModule,Header,Sidebar,Footer,RouterOutlet],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css'
})
export class AdminPanel {
   collapsed = signal(false);
}
