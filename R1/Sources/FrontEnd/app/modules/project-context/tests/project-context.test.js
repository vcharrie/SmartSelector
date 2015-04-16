'use strict';

/**
 * Tests for home
 */
describe('projectContext controller', function () {

    var scope, 
        rootScope,
        ctrl,
        projectService;

  // Load angular module
  beforeEach(function () {
      module('projectContext');
    }
  );

    // Dependencies injection
    beforeEach(inject(function ($rootScope, $controller, _projectService_, _$q_) {     
        projectService = _projectService_;
        projectService.createNewProject();

        spyOn(projectService, 'loadCharacteristics').andReturn(_$q_.defer().promise);

        scope = $rootScope.$new();
        rootScope = $rootScope;

        ctrl = $controller('projectContext', {
            $scope: scope,
            projectService: projectService
        });

        spyOn(scope, 'onCharacteristicSelected');
    }));
});
