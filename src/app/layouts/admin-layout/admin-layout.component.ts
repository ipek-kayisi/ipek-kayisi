import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `<div class="admin-shell">
    <aside>
      <a class="brand" routerLink="/"><span class="mark">İ</span><span>İPEK <small>YÖNETİM PANELİ</small></span></a>
      <span class="label">YÖNETİM</span>
      <a routerLink="/admin" [routerLinkActiveOptions]="{exact:true}" routerLinkActive="active"><img src="/layout-dashboard.svg" alt=""><span>Genel Bakış</span></a>
      <a routerLink="/admin/orders" routerLinkActive="active"><img src="/clipboard-list.svg" alt=""><span>Siparişler</span></a>
      <a routerLink="/admin/products" routerLinkActive="active"><img src="/package.svg" alt=""><span>Ürünler</span></a>
      <a routerLink="/admin/categories" routerLinkActive="active"><img src="/tags.svg" alt=""><span>Kategoriler</span></a>
      <button (click)="logout()"><img src="/log-out.svg" alt=""><span>Çıkış yap</span></button>
      <a class="store-link" routerLink="/"><img src="/arrow-left.svg" alt=""><span>Mağazaya dön</span></a>
    </aside>
    <main><header><span>İpek Toptan / Yönetim</span><b>Yönetici</b></header><section class="content"><router-outlet /></section></main>
  </div>`,
  styles: [`.admin-shell{display:grid;grid-template-columns:235px 1fr;min-height:100vh;background:#f6f7f4;color:#2b4237;font:13px system-ui}.admin-shell aside{background:#10483d;color:#e6eee8;padding:24px 17px;display:flex;flex-direction:column;gap:9px}.brand{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none;font-weight:800;letter-spacing:.1em;margin-bottom:35px}.brand .mark{width:38px;height:38px;border:1px solid #dfa752;border-radius:50%;display:grid;place-items:center;font:italic 25px Georgia}.brand small{display:block;font-size:8px;letter-spacing:.14em;margin-top:3px}.label{font-size:9px;color:#9bb3a4;letter-spacing:.14em;margin:4px 10px}.admin-shell aside>a:not(.brand),.admin-shell aside button{display:flex;align-items:center;gap:9px;padding:12px 10px;color:#d2dfd6;text-decoration:none;border:0;border-radius:5px;background:none;text-align:left;font:inherit;cursor:pointer}.admin-shell aside>a.active,.admin-shell aside>a:not(.brand):hover,.admin-shell aside button:hover{background:#ffffff19;color:white}.admin-shell aside>a img,.admin-shell aside button img{width:17px;height:17px;flex:none;filter:brightness(0) invert(1)}.admin-shell aside button{margin-top:auto}.admin-shell aside .store-link{margin-top:8px;border-top:1px solid #ffffff22;border-radius:0;padding-top:16px}.admin-shell main>header{height:66px;background:white;border-bottom:1px solid #e8ebe5;display:flex;align-items:center;justify-content:space-between;padding:0 30px;color:#78857c}.admin-shell main>header b{color:#2b5142}.content{padding:28px;max-width:1250px;margin:auto}@media(max-width:700px){.admin-shell{grid-template-columns:1fr}.admin-shell aside{display:grid;grid-template-columns:1fr 1fr;padding:16px}.admin-shell aside .brand,.admin-shell aside .label,.admin-shell aside .store-link{grid-column:1/-1}.admin-shell aside .brand{margin-bottom:12px}.admin-shell aside button{margin-top:0}.admin-shell main>header{padding:0 17px}.content{padding:16px}}`],
})
export class AdminLayoutComponent {
  private readonly auth = inject(AuthService);
  async logout(): Promise<void> { await this.auth.signOut(); location.href = '/admin/login'; }
}
