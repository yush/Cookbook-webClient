'use strict';

describe('Service: listCategories', function () {

  // load the service's module
  beforeEach(module('webClientApp'));

  // instantiate service
  var listCategories;
  beforeEach(inject(function (_listCategories_) {
    listCategories = _listCategories_;
  }));

  it('should do something', function () {
    expect(!!listCategories).toBe(true);
  });

});
