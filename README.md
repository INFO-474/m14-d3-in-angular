# Module 14: Using Angular with D3.js

## Overview
The [previous module](https://github.com/INFO-474/m13-angular) introduced the Angular framework and described the importance of using frameworks for organizing robust web applications that contain visualizations. This module introduces a suggested pattern for integrating reusable D3.js code into Angular applications. This approach depends on understanding [reusable charts in D3](https://github.com/INFO-474/m10-reusability/), and a basic [familiarity with Angular](https://github.com/INFO-474/m13-angular).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Contents**

- [Resources](#resources)
- [Custom Directives](#custom-directives)
  - [Use case](#use-case)
  - [Syntax](#syntax)
- [D3 Chart Directives](#d3-chart-directives)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Resources
Here are a few resources to get you started using Angular with D3:

- [List of D3 + Angular Resources](https://www.dashingd3js.com/d3-resources/d3-and-angular) _(Dashing-D3)_
- [D3 on Angular](http://www.ng-newsletter.com/posts/d3-on-angular.html) _(ng-newsletter)_
- [Reusable D3 + Angular Example](http://bl.ocks.org/biovisualize/5372077) _(Chris Viau)_
- [Creating Custom Directives](https://docs.angularjs.org/guide/directive) _(Angular Docs)_
- [Normalizing Directive Names](https://docs.angularjs.org/guide/directive#matching-directives) _(Angular Docs)_

## Custom Directives
As described in the [last module](https://github.com/INFO-474/m13-angular), directives provide an **extended HTML vocabulary** that the Angular compiler will interpret and use to manipulate the DOM. This makes Angular a powerful templating engine that simplifies your HTML syntax. However -- you aren't limited to the directives that Angular has provided -- you can **create your own directives** and use them in your HTML. Note, there are myriad options for implementing your own directives, but the approach used here fits best with the D3 section below.

### Use case
Imagine you have a set of HTML elements that you want to render in your DOM for each element of data. For example, you might have a variety of contacts that you want to display as follows:

```html
<div>
  <p><strong>Name: </strong>James</p>
  <p><strong>Phone Number: </strong> 555-5555</p>
</div>
```

If you had an array of contacts in your controller, it would be trivial to repeat this section for an array of people using the `ng-repeat` directive.

```html
<div ng-repeat="person in contacts">
  <p><strong>Name: </strong>{{person.name}}</p>
  <p><strong>Phone Number: </strong> {{person.phone}}</p>
</div>
```

However, this is somewhat messy, and doesn't take advantage of the fact that Angular works as a templating engine. What if instead, we could build a custom `<my-contact>` directive, and render a separate element for each person in our contact list? This would simplify our `index.html` file, clarify where to go to update the format for each contact, and make collaboration easier by breaking out the `<my-contact>` directive into an isolated component.

### Syntax
As you might imagine, you specify custom directives for your module in your JavaScript code using the `.directive` method on your module. The `.directive` method takes two parameters: a directive name, and a constructor function. Note: the directive names **must be** lower-case, and are suggested to be camelCase. These names are then **normalized**, meaning that your directive `myDirective` (defined in JavaScript) will be reference in your HTML file as `my-directive` ([more info](https://docs.angularjs.org/guide/directive#matching-directives)).

The constructor function you pass to the `.directive` method should **return an object** that details how Angular should render elements in the DOM. Here is an example of how we could generate our `contact` directive:

```javascript
// Create module `myApp` with no dependencies
var myApp = angular.module("myApp", [])

// Add controller
myApp.controller('Ctrl', function($scope) {
  // Define an array of contacts
  $scope.contacts = [
    {name:'James', phone:'555-5555'},
    {name:'Andrea', phone:'444-5555'},
    {name:'Steph', phone:'333-5555'},
  ];
})

// Create a directive for this app
myApp.directive('myContact', function() {
  return {
    restrict:'E', // Restrict to a new element type
    template: '<div><p><strong>Name: </strong>{{person.name}}</p><p><strong>Phone Number:</strong> {{person.phone}}</p></div>'
  };
});
```

Because you've created a new element type (`restrict:'E'`), you can then place the element **directly in the DOM**:

```html
<body ng-app="myApp" ng-controller="myCtrl">
  <my-contact ng-repeat="person in contacts"></my-contact>
</body>
```
As an aside, you can use the `templateUrl` property to save the template in a separate `.html` file. However, we'll have to change this approach slightly for using D3.

## D3 Chart Directives
Because D3 and Angular are both great at manipulating the DOM, we'll need to choose which one we want to use to put elements on the screen. Because D3 is built to perform data-layouts and stage animated transitions, we'll **use D3 to manipulate the DOM**. Angular will be used to listen to changes to `model`, and fire events when appropriate.

Given this approach, we'll need to create an Angular directive this is configured to let the internal (D3) code **manipulate the DOM**. To do this, we'll specify a `link` property on the object returned by our `.directive` method, which is suggetsed by the [documentation](https://docs.angularjs.org/guide/directive#matching-directives):

> Directives that want to modify the DOM typically use the link option to register DOM listeners as well as update the DOM. It is executed after the template has been cloned and is where directive logic will be put.

For additional information on the use of the `link` property, see [here](https://docs.angularjs.org/api/ng/service/$compile#-link-). The link function takes in a variety of variables, two of which we'll focus on here:

>`scope`: the `scope` variable (note the lack of a `$`), contains data within the inner scope for our directive. There are a variety of methods for passing information from an outer `$scope` to a directive's `scope`, but for simplicity, we'll just set the inner `scope` to the module's `$scope` by setting the parameter (`{scope:false}`) in the object returned by our directive (example below).

>`elem`: the `elem` variable represents the DOM element that the `link` function will be manipulating. To select the element itself, we'll use `d3.select(elem[0])`.

Inside of the `link` function, we'll manipulate the DOM element through the `elem` parameter. For example, here is how we could build our chart on a selected element:

```javascript
// Create a directive 'barChart' that creates a bar chart
app.directive('barChart', function() {
	// Return your directive element
	return {
		restrict:'E', // this directive is specified as an html element <bar-chart>
    scope:false, // use the same scope as the module
		// Create a link function that allows dynamic element creation
		link:function(scope,elem) {
        // Instantiate your chart and specify parameters
        var myChart = BarChart().color('blue');

  			// Wrapper element to put your chart in
  			var chart = d3.select(elem[0]) // select the DOM element
          .datum(scope.data) // use the data from the scope
          .call(myChart);
			});
		}
	};
});
```

However, this function only builds the chart once. If we want the chart to update when the data changes, we'll have to use the `scope.$watch` functionality to listen to changes to a particular variable that is part of `scope`. For example, if we wanted to update the chart anytime the variable `scope.data` changed, we would use this implementation:

```javascript
// Create a directive 'barChart' that creates a bar chart
app.directive('barChart', function() {
	// Return your directive element
	return {
		restrict:'E', // this directive is specified as an html element <bar-chart>
    scope:false, // use the same scope as the module
		// Create a link function that allows dynamic element creation
		link:function(scope,elem) {
        // Instantiate your chart and specify parameters
        var myChart = BarChart().color('blue');
        var chart = d3.select(elem[0]) // select the DOM element

        // Watch for changes to scope.data: rebind the data and update the chart
  			scope.$watch('data', function() {
          chart.datum(scope.data) // use the data from the scope
               .call(myChart); // call the chart function
        }, true) // check for object equality!  
			});
		}
	};
});
```

It's easy to miss, but the `$watch` method takes in **three** parameters: an **expression** to watch (`data`), a **listener** to execute on change (`function(){...}`), and a boolean value that indicates whether or not the compiler should check for **object equality** in the object (`true`). This is clearly an issue [many people have encountered](http://stackoverflow.com/questions/15363259/watch-not-being-triggered-on-array-change). If you're doing something like pushing an element into an array, that event **would not fire** unless you were checking for object equality.

If you want to watch changes to multiple different pieces of data, you can use the `scope.$watchGroup`:

```javascript
scope.$watch(['data', 'color', function() {
  // Reset the color
  myChart.color(scope.color);

  // Rebind the data and call the chart
  chart.datum(scope.data) // use the data from the scope
       .call(myChart); // call the chart function
}, true) // check for object equality!  
```

This implementation allows D3 to manage the data-join between the data and the DOM, while leveraging Angular to ensure that the DOM is manipulated when the data changes. For an example, see [demo-1](demo-1).
