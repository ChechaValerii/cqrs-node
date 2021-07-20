const angles = angular.module('angles', []);

angles.chart = function (type) {
  return {
    restrict: 'A',
    scope: {
      data: '=',
      options: '=',
      id: '@',
      width: '=',
      height: '=',
      resize: '=',
      chart: '@',
      segments: '@',
      responsive: '=',
      tooltip: '=',
      legend: '=',
      maintainAspectRatio: '=',
    },
    link($scope, $elem) {
      const ctx = $elem[0].getContext('2d');
      let autosize = false;

      $scope.size = function () {
        if ($scope.width <= 0 || !$scope.width) {
          $elem.width($elem.parent().width());
          ctx.canvas.width = $elem.width();
        } else {
          ctx.canvas.width = $scope.width || ctx.canvas.width;
          autosize = true;
        }

        if ($scope.height <= 0 || !$scope.height) {
          $elem.height($elem.parent().height());
          ctx.canvas.height = ctx.canvas.width / 2;
        } else {
          ctx.canvas.height = $scope.height || ctx.canvas.height;
          autosize = true;
        }
      };

      $scope.$watch('data', (newVal, oldVal) => {
        if (chartCreated) {
          chartCreated.destroy();
        }

        const options = $scope.options || {};

        // if data not defined, exit
        if (!newVal) {
          return;
        }
        if ($scope.chart) { type = $scope.chart; }

        if (autosize) {
          $scope.size();
          chart = new Chart(ctx);
        }

        if ($scope.responsive || $scope.resize) {
          options.responsive = true;
        }

        if ($scope.responsive !== undefined) {
          options.responsive = $scope.responsive;
        }

        if ($scope.maintainAspectRatio !== undefined) {
          options.maintainAspectRatio = $scope.maintainAspectRatio;
        }

        chartCreated = chart[type]($scope.data, options);
        chartCreated.update();
        if ($scope.legend) {
          angular.element($elem[0]).parent().next().remove();
          angular.element($elem[0]).parent().after(chartCreated.generateLegend());
        }
      }, true);

      $scope.$watch('tooltip', (newVal, oldVal) => {
        if (chartCreated) {
          chartCreated.draw();
        }
        if (newVal === undefined || !chartCreated.segments) {
          return;
        }
        if (!isFinite(newVal) || newVal >= chartCreated.segments.length || newVal < 0) {
          return;
        }
        const activeSegment = chartCreated.segments[newVal];
        activeSegment.save();
        activeSegment.fillColor = activeSegment.highlightColor;
        chartCreated.showTooltip([activeSegment]);
        activeSegment.restore();
      }, true);

      $scope.size();
      var chart = new Chart(ctx);
      let chartCreated;
    },
  };
};

/* Aliases for various chart types */
angles.directive('chart', () => angles.chart());
angles.directive('linechart', () => angles.chart('Line'));
angles.directive('barchart', () => angles.chart('Bar'));
angles.directive('radarchart', () => angles.chart('Radar'));
angles.directive('polarchart', () => angles.chart('PolarArea'));
angles.directive('piechart', () => angles.chart('Pie'));
angles.directive('doughnutchart', () => angles.chart('Doughnut'));
angles.directive('donutchart', () => angles.chart('Doughnut'));
