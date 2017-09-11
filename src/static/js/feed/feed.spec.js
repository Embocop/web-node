describe('tg.feed', function () {

    let compile, scope, feedElem;

    describe('feed directive', function () {
        beforeEach(function() {
            angular.mock.module('tg.feed');
            inject(function($compile, $rootScope){
                compile = $compile;
                scope = $rootScope.$new();
            });
            const element = angular.element('<feed></feed>');
            const compiledElement = compile(element)(scope);
            scope.$digest();
            feedElem = compiledElement;
        });

        it('should be defined', function() {
            expect(feedElem).toBeDefined();
        });

        it('should have a div element', function () {
            const divElement = feedElem.find('div');
            expect(divElement).toBeDefined();
        })
    });

});