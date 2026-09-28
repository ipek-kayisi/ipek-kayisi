import { Component, OnInit, computed, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ContactsService } from '../../core/services/contacts.service';

@Component({
  selector: 'app-contacts', standalone: true,
  template: `<section class="contacts"><span class="eyebrow">SİZİ DİNLEMEK İSTERİZ</span><h1>İletişim</h1><p>Ürünlerimiz ve toptan satış hakkında bize ulaşın.</p>
    <div class="contact-grid">
      <article><img src="/phone.svg" alt=""><h2>Telefon</h2><p>Hafta içi 09.00 – 18.00</p><a [href]="'tel:' + contacts.contacts().phone">{{ contacts.contacts().phone }}</a>@if (contacts.contacts().phone2) { <a [href]="'tel:' + contacts.contacts().phone2">{{ contacts.contacts().phone2 }}</a> }</article>
      <article><img src="/whatsapp.svg" alt=""><h2>WhatsApp</h2><p>Hızlıca mesaj gönderin</p>@if (contacts.contacts().phoneWp) { <a [href]="contacts.contacts().phoneWp" target="_blank" rel="noopener">WhatsApp'tan yazın</a> } @else { <span class="muted">Bilgi yakında eklenecek</span> }</article>
      <article><img src="/mail.svg" alt=""><h2>E-posta</h2><p>Sorularınız için bize yazın</p><a [href]="'mailto:' + contacts.contacts().mail">{{ contacts.contacts().mail }}</a></article>
      <article><img src="/instagram.svg" alt=""><h2>Instagram</h2>@if (contacts.contacts().intagram) { <a [href]="contacts.contacts().intagram" target="_blank" rel="noopener">Instagram'da takip edin</a> } @else { <span class="muted">Bilgi yakında eklenecek</span> }</article>
      <article><img src="/facebook.svg" alt=""><h2>Facebook</h2>@if (contacts.contacts().facebook) { <a [href]="contacts.contacts().facebook" target="_blank" rel="noopener">Facebook sayfamız</a> } @else { <span class="muted">Bilgi yakında eklenecek</span> }</article>
      <article><img src="/map-pinned.svg" alt=""><h2>Mağazamız</h2><p>Konumumuzu haritada görün</p><a [href]="contacts.contacts().mapUrl" target="_blank" rel="noopener">Yol tarifi alın <img class="arrow" src="/arrow-up-right.svg" alt=""></a></article>
    </div>
    <div class="map"><iframe title="Mağaza haritası" [src]="mapUrl()" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
  </section>`,
  styles: [`.contacts{max-width:1160px;min-height:70vh;margin:auto;padding:65px 20px;text-align:center}.eyebrow{font-size:10px;letter-spacing:.15em;color:#849078;font-weight:800}.contacts h1{font:44px Georgia;color:#155044;margin:12px}.contacts>p{font-size:13px;color:#858b82}.contact-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin:38px 0}.contact-grid article{display:flex;flex-direction:column;align-items:center;gap:5px;background:white;border:1px solid #ebece5;border-radius:8px;padding:26px}.contact-grid article>img{width:25px;height:25px}.contact-grid h2{font:20px Georgia;color:#245447;margin:8px 0 0}.contact-grid p{font-size:11px;color:#858b82;margin:4px 0}.contact-grid a,.muted{color:#24604f;font-weight:700;font-size:12px;text-decoration:none}.muted{color:#858b82;font-weight:400}.contact-grid a .arrow{width:13px;height:13px;vertical-align:middle;margin-left:4px}.map{height:310px;border-radius:10px;overflow:hidden}.map iframe{width:100%;height:100%;border:0}@media(max-width:650px){.contact-grid{grid-template-columns:1fr}.contacts{padding-top:40px}}`],
})
export class ContactsComponent implements OnInit {
  readonly contacts = inject(ContactsService);
  private readonly sanitizer = inject(DomSanitizer);
  readonly mapUrl = computed<SafeResourceUrl>(() => {
    const url = this.contacts.contacts().mapUrl;
    return this.sanitizer.bypassSecurityTrustResourceUrl(`${url}${url.includes('?') ? '&' : '?'}output=embed`);
  });

  ngOnInit(): void { void this.contacts.load(); }
}
