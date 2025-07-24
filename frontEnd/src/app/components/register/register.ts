import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service'; // <-- Import UserService
import { User } from '../../model/user.model'; // <-- Import User model

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  registerForm: FormGroup;
  regions: string[] = ['Zanzibar', 'Dar es Salaam', 'Arusha', 'Dodoma', 'Mwanza'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService // <-- Inject UserService
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      region: ['', Validators.required],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatch });
  }

  passwordsMatch(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { fullName, email, region, password } = this.registerForm.value;
      const user: User = { fullName, email, region, password };
      this.userService.register(user).subscribe({
        next: (res) => {
          alert('Registration successful!');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          alert('Registration failed: ' + (err.error?.message || err.message));
        }
      });
    }
  }
}