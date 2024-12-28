import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.css'],
})
export class UpdateProfileComponent implements OnInit {
  userData = {
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  };
  updateSuccess = false;
  updateError = false;
  currentPasswordError = false;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  fetchUserProfile(): void {
    this.userService.getUserProfile().subscribe(
      (user) => {
        this.userData.name = user.name;
        this.userData.email = user.email;
      },
      (error) => {
        console.error('Error fetching user profile:', error);
      }
    );
  }

  onSubmit(updateForm: any): void {
    if (updateForm.valid && this.userData.newPassword === this.userData.confirmNewPassword) {
      const { name, email, currentPassword, newPassword } = this.userData;


      if (this.userService.verifyCurrentPassword(currentPassword)) {
        this.userService.updateProfileWithPassword({ name, email, currentPassword, newPassword }).subscribe(
          (response) => {
            this.updateSuccess = true;
            this.updateError = false;

            setTimeout(() => {
              this.router.navigate(['/']);
            }, 2000);
          },
          (error) => {
            console.error('Error updating profile:', error);
            this.updateSuccess = false;
            this.updateError = true;
          }
        );
      } else {
        this.currentPasswordError = true;
      }
    }
  }
}
