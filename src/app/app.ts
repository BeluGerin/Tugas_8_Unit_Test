import { Component, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Menu {
  id: number;
  menu_name: string;
  url_menu: string;
  parent_id: number;
  is_active: number;
  isOpen?: boolean;
  children?: Menu[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = 'http://localhost/Unit_test/api-menu.php';

  constructor(private http: HttpClient) {}

  getMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>(this.apiUrl).pipe(
      map(rawMenus => this.buildMenuTree(rawMenus))
    );
  }

  private buildMenuTree(list: Menu[]): Menu[] {
    if (!Array.isArray(list)) return [];

    const map = new Map<number, Menu>();
    const roots: Menu[] = [];

    list.forEach(item => {
      map.set(item.id, { ...item, isOpen: false, children: [] });
    });

    list.forEach(item => {
      const node = map.get(item.id);
      if (node) {
        if (item.parent_id === 0) {
          roots.push(node);
        } else {
          const parentNode = map.get(item.parent_id);
          if (parentNode) {
            parentNode.children?.push(node);
          }
        }
      }
    });

    return roots;
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sidebar-container">
      <h3>Sidebar Menu</h3>
      <ul class="menu-list">
        <li *ngFor="let menu of menuList$ | async" class="menu-item">
          
          <div *ngIf="menu.children && menu.children.length > 0; else singleMenu" 
               class="menu-parent" 
               (click)="toggleMenu(menu)">
            <span>{{ menu.menu_name }}</span>
          </div>

          <ng-template #singleMenu>
            <a [href]="menu.url_menu" class="menu-link">{{ menu.menu_name }}</a>
          </ng-template>

          <ul class="submenu" *ngIf="menu.children && menu.children.length > 0" [class.show]="menu.isOpen">
            <li *ngFor="let sub of menu.children">
              <a [href]="sub.url_menu" class="submenu-link">↳ {{ sub.menu_name }}</a>
            </li>
          </ul>

        </li>
      </ul>
    </div>
  `,
  styles: [`
    .sidebar-container {
      width: 260px;
      height: 100vh;
      background-color: #2c3e50;
      color: #ecf0f1;
      padding: 20px;
      font-family: Arial, sans-serif;
      box-sizing: border-box;
    }
    h3 {
      text-align: center;
      margin-bottom: 20px;
      font-size: 18px;
      border-bottom: 1px solid #34495e;
      padding-bottom: 10px;
    }
    .menu-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .menu-item {
      margin-bottom: 8px;
    }
    .menu-parent, .menu-link, .submenu-link {
      display: flex;
      align-items: center;
      padding: 10px 15px;
      color: #ecf0f1;
      text-decoration: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
      font-size: 14px;
    }
    .menu-parent:hover, .menu-link:hover, .submenu-link:hover {
      background-color: #34495e;
    }
    .submenu {
      list-style: none;
      padding-left: 15px;
      margin: 0;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease-in-out;
    }
    .submenu.show {
      max-height: 200px;
    }
    .submenu-link {
      padding: 8px 10px;
      font-size: 13px;
      color: #bdc3c7;
    }
  `]
})
export class App {
  menuList$: Observable<Menu[]>;

  constructor(private menuService: MenuService) {
    this.menuList$ = this.menuService.getMenus();
  }

  toggleMenu(menu: Menu): void {
    menu.isOpen = !menu.isOpen;
  }
}