app
  .directive('countTo', ['$timeout', function ($timeout) {
    return {
      replace: false,
      scope: true,
      link(scope, element, attrs) {
        const e = element[0];
        let num; let refreshInterval; let duration; let steps; let step; let countTo; let value; let
          increment;

        const calculate = function () {
          refreshInterval = 30;
          step = 0;
          scope.timoutId = null;
          countTo = parseInt(attrs.countTo) || 0;
          scope.value = parseInt(attrs.value, 10) || 0;
          duration = (parseFloat(attrs.duration) * 1000) || 0;

          steps = Math.ceil(duration / refreshInterval);
          increment = ((countTo - scope.value) / steps);
          num = scope.value;
        };

        var tick = function () {
          scope.timoutId = $timeout(() => {
            num += increment;
            step++;
            if (step >= steps) {
              $timeout.cancel(scope.timoutId);
              num = countTo;
              e.textContent = countTo;
            } else {
              e.textContent = Math.round(num);
              tick();
            }
          }, refreshInterval);
        };

        const start = function () {
          if (scope.timoutId) {
            $timeout.cancel(scope.timoutId);
          }
          calculate();
          tick();
        };

        attrs.$observe('countTo', (val) => {
          if (val) {
            start();
          }
        });

        attrs.$observe('value', (val) => {
          start();
        });

        return true;
      },
    };
  }]);
