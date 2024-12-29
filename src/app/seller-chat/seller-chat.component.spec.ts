import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerChatComponent } from './seller-chat.component';

describe('SellerChatComponent', () => {
  let component: SellerChatComponent;
  let fixture: ComponentFixture<SellerChatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SellerChatComponent]
    });
    fixture = TestBed.createComponent(SellerChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
