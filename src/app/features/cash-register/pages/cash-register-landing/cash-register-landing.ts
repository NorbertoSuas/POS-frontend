import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CashRegisterNavComponent } from '../../components/cash-register-nav/cash-register-nav';

@Component({
  selector: 'app-cash-register-landing',
  standalone: true,
  imports: [CommonModule, CashRegisterNavComponent],
  templateUrl: './cash-register-landing.html',
  styleUrl: './cash-register-landing.css'
})
export class CashRegisterLandingPage {
  // This is a simple landing page that shows the navigation
  // Users can click on the navigation items to go to specific sections
}
