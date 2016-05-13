
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
			// Use the scope.$watch method to watch for changes to the step, then re-draw your chart
			scope.$watch('data', function() {
        console.log('data stuff!')
        console.log(scope.data)
        // Instantiate your chart with given settings
        var myChart = BarChart().xVar('name')
                                .yVar('concerts')
                                .xAxisLabel('Name')
                                .yAxisLabel('Concerts Attended');

  			// Wrapper element to put your svg (chart) in
  			wrapper = d3.select(elem[0])
          .datum(scope.data)
          .call(myChart);
			}, true);
		}
	};
});
