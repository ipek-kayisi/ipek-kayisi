import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { addDoc, collection, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { Category } from '../../core/models/category.model';
import { CategoryService } from '../../core/services/category.service';
import { db, firebaseConfigured } from '../../core/firebase';

@Component({
  selector: 'app-admin-categories', standalone: true, imports: [FormsModule],
  template: `<h1>Kategori yönetimi</h1><p>{{ message() }}</p><div class="grid"><section>@for(category of categories.categories(); track category.id){<article><span>{{ category.iconUrl }}</span><b>{{ category.name }}</b><small>{{ category.slug }}</small><button type="button" (click)="edit(category)">Düzenle</button><button type="button" (click)="remove(category.id)">Sil</button></article>}</section><form (ngSubmit)="save()"><h2>{{ editingId()?'Kategoriyi düzenle':'Yeni kategori' }}</h2><label>Ad<input name="name" [(ngModel)]="name" required></label><label>Slug<input name="slug" [(ngModel)]="slug" required></label><label>İkon / emoji<input name="icon" [(ngModel)]="icon"></label><button>{{ editingId()?'Kaydet':'Kategori ekle' }}</button></form></div>`,
  styles: [`.grid{display:grid;grid-template-columns:1fr 300px;gap:18px}section,form{background:#fff;padding:18px}article{display:flex;align-items:center;gap:10px;border-bottom:1px solid #eee;padding:12px 0}article b{flex:1}article small{color:#888}label{display:block;margin:12px 0;font-size:12px}input{display:block;width:100%;padding:9px;margin-top:5px;border:1px solid #ddd}button{padding:7px;border:1px solid #ddd;background:#fff;cursor:pointer}@media(max-width:700px){.grid{grid-template-columns:1fr}}`],
})
export class AdminCategoriesComponent implements OnInit {
  readonly categories = inject(CategoryService);
  readonly message = signal('');
  readonly editingId = signal('');
  name = ''; slug = ''; icon = '🌿';
  ngOnInit(): void { void this.categories.load(); }
  edit(category: Category): void { this.editingId.set(category.id); this.name = category.name; this.slug = category.slug; this.icon = category.iconUrl; }
  async save(): Promise<void> {
    if (!firebaseConfigured) { this.message.set('Kategorileri kaydetmek için Firebase ayarları gereklidir.'); return; }
    try {
      const data = { name: this.name, slug: this.slug, iconUrl: this.icon };
      if (this.editingId()) await setDoc(doc(db, 'categories', this.editingId()), data);
      else await addDoc(collection(db, 'categories'), data);
      await this.categories.load(); this.message.set('Kategori kaydedildi.'); this.editingId.set(''); this.name = ''; this.slug = ''; this.icon = '🌿';
    } catch { this.message.set('Kategori kaydedilemedi.'); }
  }
  async remove(id: string): Promise<void> {
    if (!firebaseConfigured) { this.message.set('Firebase yapılandırması gereklidir.'); return; }
    try { await deleteDoc(doc(db, 'categories', id)); this.categories.categories.update(items => items.filter(item => item.id !== id)); this.message.set('Kategori silindi.'); }
    catch { this.message.set('Kategori silinemedi.'); }
  }
}
