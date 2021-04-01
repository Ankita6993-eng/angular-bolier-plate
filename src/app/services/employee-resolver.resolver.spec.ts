import { TestBed } from '@angular/core/testing';

import { EmployeeResolverResolver } from './employee-resolver.resolver';

describe('EmployeeResolverResolver', () => {
  let resolver: EmployeeResolverResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(EmployeeResolverResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
