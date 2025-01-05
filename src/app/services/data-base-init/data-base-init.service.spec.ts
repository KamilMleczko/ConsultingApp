import { TestBed } from '@angular/core/testing';

import { DataBaseInitService } from './data-base-init.service';

describe('DataBaseInitService', () => {
  let service: DataBaseInitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataBaseInitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
