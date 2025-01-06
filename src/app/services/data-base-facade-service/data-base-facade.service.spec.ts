import { TestBed } from '@angular/core/testing';

import { DataBaseFacadeService } from './data-base-facade.service';

describe('DataBaseFacadeService', () => {
  let service: DataBaseFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataBaseFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
