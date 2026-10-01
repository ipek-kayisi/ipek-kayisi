import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `<main class="login-wrap">
    <a routerLink="/" class="brand"
      ><span>İ</span><b>İPEK <small>TOPTAN KURU GIDA</small></b></a
    >
    <form [formGroup]="form" (ngSubmit)="submit()">
      <span>YÖNETİCİ GİRİŞİ</span>
      <h1>Tekrar hoş geldiniz</h1>
      <p>Yönetim paneline devam etmek için giriş yapın.</p>
      <label
        >E-posta<input
          type="email"
          formControlName="email"
          placeholder="admin@ipektoptan.com" /></label
      ><label
        >Şifre
        <div>
          <input
            [type]="showPassword() ? 'text' : 'password'"
            formControlName="password"
            placeholder="••••••••" />
        <button
          type="button"
          class="toggle-password-btn"
          (click)="togglePasswordVisibility()"
          [attr.aria-label]="showPassword() ? 'Скрыть пароль' : 'Показать пароль'"
          [attr.aria-pressed]="showPassword()"
        >
          @if (showPassword()) {
            <img src="eye-off.svg" alt="" />
          } @else {
            <img src="eye.svg" alt="" />
          }</button>
        </div>
      </label>
      @if (error()) {
        <div class="error" role="alert">{{ error() }}</div>
      }
      <button type="submit" [disabled]="form.invalid || loading()">
        {{ loading() ? 'Giriş yapılıyor…' : 'Giriş Yap →' }}
      </button>
    </form>
    <a routerLink="/" class="back">← Mağazaya dön</a>
  </main>`,
  styles: [
    `
      .login-wrap {
        min-height: 100vh;
        background: #f5f4ed;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        padding: 24px;
        box-sizing: border-box;
        font-family: system-ui;
      }
      .brand {
        display: flex;
        gap: 10px;
        align-items: center;
        color: #145044;
        text-decoration: none;
        letter-spacing: 0.1em;
        margin-bottom: 24px;
      }
      .brand > span {
        border: 1px solid #d39b49;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: grid;
        place-items: center;
        font: italic 26px Georgia;
      }
      .brand small {
        display: block;
        font-size: 8px;
        margin-top: 4px;
      }
      .login-wrap form {
        width: min(420px, 100%);
        box-sizing: border-box;
        background: white;
        border: 1px solid #ebece5;
        border-radius: 10px;
        padding: 32px;
      }
      .login-wrap form > span {
        font-size: 9px;
        letter-spacing: 0.15em;
        font-weight: 800;
        color: #8b957e;
      }
      .login-wrap h1 {
        font: 30px Georgia;
        color: #164b40;
        margin: 12px 0;
      }
      .login-wrap p {
        font-size: 12px;
        color: #818980;
        margin-bottom: 23px;
      }
      .login-wrap label {
        display: block;
        font-size: 11px;
        color: #4f6458;
        font-weight: 700;
        margin: 15px 0;
      }
      .login-wrap input {
        display: block;
        box-sizing: border-box;
        width: 100%;
        padding: 12px;
        border: 1px solid #e4e8e1;
        border-radius: 5px;
        margin-top: 7px;
        font: 12px system-ui;
      }
      .login-wrap label > div {
        position: relative;
      }
      .login-wrap label > div input {
        padding-right: 44px;
      }
      .login-wrap button {
        width: 100%;
        border: 0;
        border-radius: 5px;
        background: #ff9e16;
        padding: 13px;
        font-weight: 800;
        cursor: pointer;
      }
      .login-wrap button.toggle-password-btn {
        position: absolute;
        top: 50%;
        right: 4px;
        display: grid;
        width: 36px;
        height: 36px;
        padding: 0;
        place-items: center;
        transform: translateY(-50%);
        background: transparent;
      }
      .toggle-password-btn img {
        display: block;
        width: 18px;
        height: 18px;
      }
      .login-wrap button.toggle-password-btn:hover {
        background: #f5f4ed;
      }
      .login-wrap button.toggle-password-btn:focus-visible {
        outline: 2px solid #145044;
        outline-offset: 1px;
      }
      .login-wrap button:disabled {
        opacity: 0.55;
      }
      .back {
        margin-top: 18px;
        color: #547564;
        text-decoration: none;
        font-size: 11px;
      }
      .error {
        font-size: 11px;
        color: #a33;
        margin-bottom: 10px;
      }
    `,
  ],
})
export class AdminLoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly loading = signal(false);
  readonly error = signal('');
  showPassword = signal<boolean>(false);
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });
  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.signIn(email.trim(), password);
      await this.router.navigateByUrl('/admin');
    } catch (error) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String(error.code)
          : 'unknown';
      console.error('Admin sign-in failed:', code, error);
      const messages: Record<string, string> = {
        'auth/invalid-credential':
          'E-posta veya şifre hatalı. Firebase Authentication kullanıcısının şifresini kontrol edin.',
        'auth/user-not-found':
          'Bu e-posta ile kullanıcı bulunamadı. Firebase projesinin doğru olduğunu kontrol edin.',
        'auth/wrong-password': 'Şifre hatalı.',
        'auth/operation-not-allowed':
          'Firebase Console → Authentication → Sign-in method bölümünde E-posta/Şifre girişini etkinleştirin.',
        'auth/unauthorized-domain':
          'Bu site Firebase tarafından yetkilendirilmemiş. Authentication → Settings → Authorized domains bölümüne localhost veya site alan adını ekleyin.',
        'auth/network-request-failed':
          'Firebase bağlantısı başarısız. İnternet bağlantısını ve tarayıcı eklentilerini kontrol edin.',
        'auth/invalid-api-key':
          'Firebase API anahtarı hatalı. Web uygulaması yapılandırmasını kontrol edin.',
        'auth/too-many-requests':
          'Çok fazla deneme yapıldı. Bir süre bekleyip tekrar deneyin.',
      };
      this.error.set(
        `${messages[code] ?? 'Giriş başarısız. Firebase e-posta/şifre sağlayıcısını ve kullanıcı bilgilerini kontrol edin.'} (${code})`,
      );
    } finally {
      this.loading.set(false);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((show) => !show);
  }
}
