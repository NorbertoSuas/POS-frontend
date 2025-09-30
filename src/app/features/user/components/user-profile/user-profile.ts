import { Component, input } from '@angular/core';
import { UserDto } from '../../models/userDto';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfile {
  user = input.required<UserDto>();
}
