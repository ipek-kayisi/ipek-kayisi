import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { addDoc, collection, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { Category } from '../../core/models/category.model';
import { CategoryService } from '../../core/services/category.service';
import { db, firebaseConfigured } from '../../core/firebase';

@Component({
  selector: 'app-admin-categories', standalone: true, imports: [FormsModule],
  template: `<div class="page-heading"><div><h1>Kategori yönetimi</h1><p>{{ message() }}</p></div><button class="primary" type="button" (click)="openNew()">+ Yeni kategori ekle</button></div>
    <section class="category-list" aria-label="Kategoriler">@for(category of categories.categories(); track category.id){<article class="category-row"><div class="category-info"><img class="category-icon" [src]="'/' + categories.iconName(category.iconUrl, category.slug) + '.svg'" alt=""><b>{{ category.name }}</b></div><small>{{ category.slug }}</small><div class="actions"><button type="button" (click)="edit(category)">Düzenle</button><button type="button" (click)="remove(category.id)">Sil</button></div></article>}</section>
    @if (dialogOpen()) { <div class="backdrop" role="presentation" (click)="closeDialog()" (keydown.escape)="closeDialog()"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="category-dialog-title" (click)="$event.stopPropagation()"><h2 id="category-dialog-title">{{ editingId()?'Kategoriyi düzenle':'Yeni kategori ekle' }}</h2><form #categoryForm="ngForm" (ngSubmit)="save()"><label>Ad<input name="name" [(ngModel)]="name" required></label><label>Slug<input name="slug" [(ngModel)]="slug" required></label><label>Lucide ikon adı<select name="icon" [(ngModel)]="icon"><option value="nut">nut</option><option value="apple">apple</option><option value="sprout">sprout</option><option value="candy">candy</option><option value="leaf">leaf</option><option value="sparkles">sparkles</option><option value="package">package</option><option value="tags">tags</option></select></label><div class="dialog-actions"><button type="button" (click)="closeDialog()">İptal</button><button class="primary" [disabled]="categoryForm.invalid">{{ editingId()?'Kaydet':'Kategori ekle' }}</button></div></form></section></div> }`,
  styles: [`:host{display:block;width:100%}.page-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px}h1{margin:0}.page-heading p{color:#718078;margin:6px 0 0}.category-list{background:#fff;padding:18px;width:100%;box-sizing:border-box}.category-row{display:flex;align-items:center;gap:18px;border-bottom:1px solid #eee;padding:12px 0}.category-info{display:flex;align-items:center;gap:12px;flex:1;min-width:0}.category-info b{overflow-wrap:anywhere}.category-row small{color:#888}.category-icon{width:24px;height:24px;flex:none}.actions{display:flex;gap:8px}label{display:block;margin:12px 0;font-size:12px}input,select{box-sizing:border-box;display:block;width:100%;padding:9px;margin-top:5px;border:1px solid #ddd}button{padding:9px 12px;border:1px solid #ddd;background:#fff;cursor:pointer}button.primary{color:white;background:#d3832f;border-color:#d3832f;font-weight:700}.backdrop{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:20px;background:rgba(0,0,0,.52);backdrop-filter:blur(3px)}.dialog{width:min(560px,90vw);max-height:90vh;overflow-y:auto;box-sizing:border-box;padding:24px;background:#fff;box-shadow:0 18px 60px #0003}.dialog h2{margin:0 0 18px}.dialog-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}@media(max-width:1024px){.category-row{gap:12px}}@media(min-width:620px) and (max-width:850px){.category-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px}.category-row small{grid-column:1}.actions{grid-column:1/-1;justify-content:flex-end}}@media(max-width:619px){.page-heading{align-items:flex-start;flex-direction:column}.page-heading .primary{width:100%}.category-list{padding:12px}.category-row{align-items:stretch;flex-direction:column;gap:12px;padding:14px 0}.category-row small{overflow-wrap:anywhere}.actions{width:100%}.actions button{flex:1}.dialog{width:95vw;max-height:90vh;padding:18px}}`],
})
export class AdminCategoriesComponent implements OnInit {
  readonly categories = inject(CategoryService);
  readonly message = signal('');
  readonly editingId = signal('');
  readonly dialogOpen = signal(false);
  name = ''; slug = ''; icon = 'sprout';
  ngOnInit(): void { void this.categories.load(); }
  edit(category: Category): void { this.editingId.set(category.id); this.name = category.name; this.slug = category.slug; this.icon = category.iconUrl; this.dialogOpen.set(true); }
  openNew(): void { this.resetForm(); this.dialogOpen.set(true); }
  closeDialog(): void { this.dialogOpen.set(false); this.resetForm(); }
  private resetForm(): void { this.editingId.set(''); this.name = ''; this.slug = ''; this.icon = 'sprout'; }
  async save(): Promise<void> {
    if (!firebaseConfigured) { this.message.set('Kategorileri kaydetmek için Firebase ayarları gereklidir.'); return; }
    try {
      const data = { name: this.name, slug: this.slug, iconUrl: this.icon };
      const iconUrl = this.categories.iconName(this.icon, this.slug);
      data.iconUrl = iconUrl;
      if (this.editingId()) await setDoc(doc(db, 'categories', this.editingId()), data);
      else await addDoc(collection(db, 'categories'), data);
      await this.categories.load(); this.message.set('Kategori kaydedildi.'); this.closeDialog();
    } catch { this.message.set('Kategori kaydedilemedi.'); }
  }
  async remove(id: string): Promise<void> {
    if (!firebaseConfigured) { this.message.set('Firebase yapılandırması gereklidir.'); return; }
    try { await deleteDoc(doc(db, 'categories', id)); this.categories.categories.update(items => items.filter(item => item.id !== id)); this.message.set('Kategori silindi.'); }
    catch { this.message.set('Kategori silinemedi.'); }
  }
}
