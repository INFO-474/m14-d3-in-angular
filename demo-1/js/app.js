
var myApp = angular.module('myApp', [])

// Main controller
.controller('MainController', function($scope) {
     // Data for the chart
     $scope.data = [
       {name:'Mike', concerts:11},
       {name:'Daniel', concerts:34}
     ];

     // Function to add person
     $scope.addPerson = function() {
      $scope.data.push({name:$scope.newPerson, concerts:$scope.newConcerts});
      $scope.newPerson = '';
      $scope.newConcerts = '';
     }

 })


// Create a directive 'scatter' that creates scatterplots
.directive('barChart', function() {
	// Return your directive element
	return {
		restrict:'E', // this directive is specified as an html element <scatter>
    scope:false,
		// Create a link function that allows dynamic element creation
		link:function(scope,elem){
      // Define you chart function and chart element
      var myChart = BarChart();

      // Wrapper element to put your chart in
      var chart = d3.select(elem[0])

      // Use the scope.$watch method to watch for changes to the step, then re-draw your chart
			scope.$watch('data', function() {
        // Instantiate your chart with given settings
        myChart.xVar('name')
               .yVar('concerts')
               .xAxisLabel('Name')
               .yAxisLabel('Concerts Attended');

        // Bind data and call the chart function
        chart.datum(scope.data)
             .call(myChart);
			}, true); // Watch for object consistency!
		}
	};
});
