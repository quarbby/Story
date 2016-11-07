var app = angular.module('story', ['ui.router', 'ui.bootstrap', 'chart.js']);

app.config(['$stateProvider', '$urlRouterProvider', 'ChartJsProvider',
    function($stateProvider, $urlRouterProvider, ChartJsProvider) {
        // Configure all charts
        /*
        ChartJsProvider.setOptions({
           colours: ['#FF5252', '#FF8A80'],
           response: false
        });    
        */
        
        $stateProvider
            .state('home', {
               url: '/home',
               views: {
                    "header": {
                        templateUrl: '/html/header.html',
                        controller: 'HeaderCtrl'
                    },
                    "content": {
                       templateUrl: '/home.html',
                       controller: 'MainCtrl',
                       resolve: {
                           postPromise: ['sentences', function(sentences){
                               sentences.getAll();
                           }]
                       }
                   },
                   "footer": {
                       templateUrl: '/html/footer.html',
                       controller: 'FooterCtrl'
                   }
               }
            })
            .state('about', {
               url: '/about',
               views: {
                    "header": {
                        templateUrl: '/html/header.html',
                        controller: 'HeaderCtrl'
                    },
                    "content": {
                       templateUrl: '/html/about.html',
                   },
                   "footer": {
                       templateUrl: '/html/footer.html',
                       controller: 'FooterCtrl'
                   }
               }
            })
            .state('visualise', {
               url: '/visualise',
               views: {
                    "header": {
                        templateUrl: '/html/header.html',
                        controller: 'HeaderCtrl'
                    },
                    "content": {
                       templateUrl: '/html/visualise.html',
                       controller: 'VisualiseCtrl',
                       resolve: {
                           postPromise: ['sentences', function(sentences){
                               sentences.getAll();
                           }]
                       }
                   },
                   "footer": {
                       templateUrl: '/html/footer.html',
                       controller: 'FooterCtrl'
                   }
               }
            });
        $urlRouterProvider.otherwise('home');
    }
]);

app.directive('autoFocus', function($timeout) {
    return {
        restrict: 'AC',
        link: function(_scope, _element) {
            $timeout(function(){
                _element[0].focus();
            }, 0);
        }
    };
});

/* Create sentence factory */
app.factory('sentences', ['$http',
    function($http) {
    var o = {
      sentences: [],
      storyString: '',
      overallSentiment: null
    };
    
    o.getAll = function() {
        return $http.get('/sentences')
                .success(function(data) {
                   angular.copy(data, o.sentences); 
                });
    };
    
    o.addSentence = function(sentence) {
        return $http.post('/sentences', sentence)
                .success(function(data){
                    o.sentences.push(data);
                });
    };
    
    o.createStoryString = function() {
        // String the story string
        o.storyString = '';
        if (o.sentences.length > 0) {
            for (var i=0; i<o.sentences.length; ++i) {
                o.storyString += o.sentences[i].text + " ";
            }                        
        }
    };
    
    o.addToStoryString = function(text) {
        o.storyString += text + " ";
    };
    
    o.getOverallSentiment = function() {
        return $http.get('/watson/sentiment', 
                {params: {text: o.storyString}})
                .success(function(data) {
                    if (data.sentiment === null) {
                        o.overallSentiment = 'No sentiment detected';
                    } else {
                        var rawSentimentValue = parseFloat(data.sentiment) * 100;
                        o.overallSentiment = rawSentimentValue.toFixed(2);
                    }
                });
    };
    
    o.getSentence = function(id) {
      return $http.get('/sentences/' + id).then(function(res){
          return res.data;
      });
    };
    
    return o;
}]);

/* Main Controller */
app.controller('MainCtrl', ['$scope', '$http', '$window',
    'sentences', '$state', '$uibModal',
    function($scope, $http, $window, sentences, $state, $uibModal) {
        $scope.labelColor = "label-default",
        $scope.sentiment = sentences.overallSentiment,
        $scope.text = '',
        $scope.countryCode = '',
        $scope.sentences = sentences.sentences,
        $scope.maxlength = 140,
        $scope.$on('$stateChangeSuccess', function(){
            sentences.createStoryString();
            sentences.getOverallSentiment().then(function(result){
                $scope.sentiment = sentences.overallSentiment;
                $scope.setProgressBar();
            });
        });
        $scope.setFlagClass = function(countryCode){
            if (countryCode == undefined) {
                return;
            }

            return 'flag ' + countryCode.toLowerCase();
        };
        $scope.addSentence = function() {
            var text = $scope.text;

            var gotFullStop = text.endsWith(".");
            if (gotFullStop == false) {
                text = text + ".";
            }
            
            $scope.getCountryCode();
        
            $scope.getSentiment(text);
        
        };
        $scope.getCountryCode = function() {
            // Get country code
            $http.get('https://freegeoip.net/json/').then(
                function(res) {
                   $scope.countryCode = res.data.country_code;
                   //console.log('Inside ' + $scope.countryCode); 
                   
                   $scope.setFlagClass($scope.countryCode);
            });  
        };
        $scope.$watch('sentiment', function(value) {
            if ($scope.sentiment != null) {
                var isValuePositive = false;
                var rawSentimentValue = parseFloat($scope.sentiment);
                rawSentimentValue < 0 ? isValuePositive = false : isValuePositive = true;
                    
                var sentimentValue = Math.abs(rawSentimentValue);
                var labelColor = "label-default";
                if (sentimentValue > 75 && isValuePositive == true) {
                    labelColor = "label-success";
                } else if (sentimentValue > 35 && isValuePositive == true) {
                    labelColor = "label-warning";
                } else {
                    labelColor = "label-danger";
                }
                
                //$scope.setProgressBar();
            }
            
        });
        $scope.setProgressBar = function() {
            var isValuePositive = false;
            var rawSentimentValue = parseFloat($scope.sentiment);

            if (rawSentimentValue < 0) {
                isValuePositive = false;
            } else {
                isValuePositive = true;
            }
        
            var sentimentValue = Math.abs(rawSentimentValue);
            
            if (sentimentValue > 75 && isValuePositive == true) {
                $scope.pgBarColor = "progress-bar-success";
            } else if (sentimentValue > 35 && isValuePositive == true) {
                $scope.pgBarColor = "progress-bar-warning";
            } else {
                $scope.pgBarColor = "progress-bar-danger";
            }
        
            //$scope.sentiment = '' + rawSentimentValue.toFixed(2) + '%';
            $scope.pgBarWidth = sentimentValue.toFixed(2);
            $scope.pgBarWidthWithPercentage = rawSentimentValue + '%';
            //console.log(sentimentValue);
        };
        $scope.getSentiment = function(text) {
            sentences.addToStoryString(text);
            
            sentences.getOverallSentiment().then(function(result){
                $scope.sentiment = sentences.overallSentiment;
                console.log($scope.sentiment);
                
                $scope.setProgressBar();
                
                var rawSentimentValue = parseFloat($scope.sentiment);
                var isValuePositive = false;
                rawSentimentValue < 0 ? isValuePositive = false : isValuePositive = true;
    
                var sentimentValue = Math.abs(rawSentimentValue);
                var labelColor = "label-default";
                if (sentimentValue > 75 && isValuePositive == true) {
                    labelColor = "label-success";
                } else if (sentimentValue > 35 && isValuePositive == true) {
                    labelColor = "label-warning";
                } else {
                    labelColor = "label-danger";
                }
                
                sentences.addSentence({
                    text: $scope.text,
                    sentiment: $scope.sentiment,
                    labelColor: labelColor,
                    countryCode: $scope.countryCode,
                    timeStamp: new Date().toUTCString()
                });
                
                // Reset variables
                $scope.text = '';
                $scope.sentiment = null;
                $scope.countryCode = null;
                
            });
        };
        $scope.visualiseStory = function() {
            $state.go('visualise');
        };
        $scope.addBtnClick = function() {
            var modalInstance = $uibModal.open({
              animation: true,
              templateUrl: 'modalContent.html',
              controller: 'ModalInstanceCtrl',
            });
        
            modalInstance.result.then(function (text) {
                $scope.text = text;
                $scope.addSentence();
                console.log("Modal closed ");
            }, function () {
              console.log('Modal dismissed ');
            });
          };
    }
    
]);

/* Modal controller */
app.controller('ModalInstanceCtrl', 
    function ($scope, $uibModalInstance, $window) {
    $scope.maxlength = 140;
    $scope.text = '';

    $scope.add = function () {
        $scope.errorMsg = '';
        
        if (!$scope.text || $scope.text == '') {
            $scope.errorMsg = 'Error: Enter some text.';
        } else if (!$window.grecaptcha.getResponse()) {
            $scope.errorMsg = 'Error: Invalid Recaptcha';
        } else {
            // Send data 
            $window.grecaptcha.reset();
            $uibModalInstance.close($scope.text);
            $scope.text = '';
        }
        
    };
    
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

/* For Google Recaptcha */
app.directive('recaptcha', ['$window','$compile',
    function($window, $compile) {
  return {
    replace: true,
    link: function(scope, elem) {
      var key = '6LedoCATAAAAAGzJy6gAwJWBHUF-vvoQMhvRbIN_';          
      activate();
      function activate() {
      if (angular.isDefined($window.grecaptcha)) {        
           $window.grecaptcha.render(elem[0],{
             'sitekey': key
             });           
        } else {
          activate();  
        }
      }
    }          
  };
}]);

/* Visualise Controller */

// This allows you to put many linear charts I think
app.directive('linearChart',
    function($parse, $window, $interval, sentences){
   return {
      restrict:'EA',
      template:"<svg width='850' height='300'></svg>",
       link: function(scope, elem, attrs) {
           //var exp = $parse(attrs.chartData);
           //var dataToPlot = exp(scope);
           
           var dataToPlot = sentences.sentences;
           scope.data = sentences.sentences;
           
           var padding = 20;
           var pathClass = "path";
           var xScale, yScale, xAxisGen, yAxisGen, lineFun, tooltip;

           var d3 = $window.d3;
           var rawSvg = elem.find('svg');
           var svg = d3.select(rawSvg[0]);
           
            // Not sure why watch is not working
           scope.$watch(function(){return sentences.sentences}, function(newVal, oldVal) {
                dataToPlot = newVal;
                redrawLineChart();
           });  

           function setChartParameters() {
               xScale = d3.scale.linear()
                   .domain([1, dataToPlot.length])
                   .range([padding + 5, rawSvg.attr("width") - padding]);

               yScale = d3.scale.linear()
                   .domain([0, d3.max(dataToPlot, function (d) {
                       return parseFloat(d.sentiment);
                   })])
                   .range([rawSvg.attr("height") - padding, 0]);

               xAxisGen = d3.svg.axis()
                   .scale(xScale)
                   .orient("bottom")
                   .ticks(dataToPlot.length - 1);

               yAxisGen = d3.svg.axis()
                   .scale(yScale)
                   .orient("left")
                   .ticks(5);

               lineFun = d3.svg.line()
                   .x(function (d, i) {
                       return xScale(i);
                   })
                   .y(function (d) {
                       return yScale(parseFloat(d.sentiment));
                   })
                   .interpolate("basis");
                   
                   
                tooltip = d3.select('#linear-chart').append('div')
                                .attr('class', 'tooltip')
                                .style('opacity', 0);
           }
         
         function drawLineChart() {
               setChartParameters();

               svg.append("svg:g")
                   .attr("class", "x axis")
                   .attr("transform", "translate(0,180)")
                   .call(xAxisGen);

               svg.append("svg:g")
                   .attr("class", "y axis")
                   .attr("transform", "translate(20,0)")
                   .call(yAxisGen);

               svg.append("svg:path")
                   .attr({
                       d: lineFun(dataToPlot),
                       "stroke": "cyan",
                       "stroke-width": 2,
                       "fill": "none",
                       "class": pathClass
                   });
                   
                drawScatterPlot();
           }
           
           function drawScatterPlot() {
                svg.selectAll("circle")
                    .data(dataToPlot)
                    .enter()
                    .append("circle")
                    .style("fill", "white")
                    .attr("cx", function(d, i) { return xScale(i);})
                    .attr("cy", function(d) { return yScale(parseFloat(d.sentiment));})
                    .attr("r", 3)
                    .attr("pointer", "cursor")
                    .on('mouseover', function(d) {
                        d3.select(this).style("cursor", "pointer");
                        tooltip.transition()
                            .duration(200)
                            .style('opacity', 1.0)
                        
                        tooltip.html(d.text)
                            .style("left", (d3.event.pageX + 15 ) + 'px')
                            .style("top", (d3.event.pageY - 15) + 'px')
                    })
                    .on('mouseout', function(d) {
                        d3.select(this).style("cursor", "default");
                        tooltip.transition()
                            .duration(200)
                            .style('opacity', 0)
                });
           }

            // When data is updated
           function redrawLineChart() {
               setChartParameters();
               svg.selectAll("g.y.axis").call(yAxisGen);
               svg.selectAll("g.x.axis").call(xAxisGen);
               svg.selectAll("." + pathClass)
                   .attr({
                       d: lineFun(dataToPlot)
                   });
               drawScatterPlot();
           }
           
           drawLineChart();
       }
   };
});


app.controller('VisualiseCtrl', ['$scope', 'sentences',
    function($scope, sentences) {
        $scope.sentences = sentences.sentences;
        $scope.getCountry = function(countryCode) {
            for (var i=0; i< $scope.countries.length; ++i) {
                if ($scope.countries[i].countryCode == countryCode) {
                    return $scope.countries[i];
                } 
                return null;
            }
        };
                
        $scope.init = function() {
            $scope.lineData = [];
            $scope.countries = [];
            $scope.countries.push({
               'countryCode': 'None',
               'count': 0,
               'sentiment': 0
            });
            
            for (var i=0; i<$scope.sentences.length; ++i) {
                var sentence = $scope.sentences[i];
                $scope.lineData.push(sentence.sentiment);
                
                if (sentence.countryCode == null || sentence.countryCode == '') {
                    var country = $scope.getCountry('None');
                    country['count'] += 1;
                    country['sentiment'] = country['sentiment'] + parseFloat(sentence.sentiment);
                } else {
                    var country = $scope.getCountry(sentence.countryCode);
                    if (country != null) {
                        country['count'] += 1;
                        country['sentiment'] = country['sentiment'] + parseFloat(sentence.sentiment);
                    } else {
                        var newCountry = {
                            'countryCode': sentence.countryCode,
                            'count': 1,
                            'sentiment': parseFloat(sentence.sentiment)
                        };
                        $scope.countries.push(newCountry);
                    }
                }
                
            }
            
            for (var i=0; i<$scope.countries.length; ++i) {
                var country = $scope.countries[i];
                country['avgSentiment'] = country['sentiment']/ country['count'];
            }
            
        };
        
        $scope.setLineChart = function() {
            
            $scope.lineLabels = Array.apply(null, {length: $scope.sentences.length})
                                    .map(Number.call, Number);
            $scope.lineLabels.map(function(label) { return label.toString(); });
            $scope.series = ['Sentiment'];
            
            $scope.json = {
                "series": ["Sentiment"],
                "data": [$scope.lineData],
                "labels": $scope.lineLabels,
                "colours": [{ 
                  "fillColor": "rgba(224, 108, 112, 1)",
                  "strokeColor": "rgba(207,100,103,1)",
                  "pointColor": "rgba(220,220,220,1)",
                  "pointStrokeColor": "#fff",
                  "pointHighlightFill": "#fff",
                  "pointHighlightStroke": "rgba(151,187,205,0.8)"
                }]
              };
              
        };
        
        $scope.setPieChart = function() {
            $scope.doughnutSeries = ['Count of Countries'];
            
            $scope.doughnutLabel = [];
            $scope.doughnutData = [];
            
            console.log($scope.countries);
            
            for (var i=0; i<$scope.countries.length; i++) {
                var country = $scope.countries[i];
                $scope.doughnutLabel.push(country.countryCode);
                $scope.doughnutData.push(country.count);
            }

            console.log($scope.doughnutLabel, $scope.doughnutData);
        };
        
        $scope.setBarChart = function() {
            var barData = [];
            $scope.barLabels = [];
            $scope.barSeries = ['CountryAvgSentiment'];
            
            for (var i=0; i<$scope.countries.length; i++) {
                var country = $scope.countries[i];
                $scope.barLabels.push(country.countryCode);
                barData.push(country.avgSentiment);
            }
            
            $scope.barData = [barData];
        };
        
        $scope.watcherFunction = function(newData) {
            $scope.setLineChart();    
        };
        
        $scope.init();
        $scope.setLineChart();
        $scope.setPieChart();
        $scope.setBarChart();
        $scope.$watch($scope.sentences, $scope.watcherFunction, true);
    }
]);

/* Header Controller */

app.controller('HeaderCtrl', ['$scope', '$state', '$window',
    function($scope, $state, $window) {
        /* Back to Top Scroll Button */
        $scope.$on('$viewContentLoaded', function() {
            var offset = 250;
            var duration = 300;
            var windowEl = angular.element($window);
            
            windowEl.on('scroll', function(){
               if ($(this).scrollTop() > offset) {
                   $('.back-to-top').fadeIn(duration);
               } else {
                   $('.back-to-top').fadeOut(duration);
               }
               
            $('.back-to-top').click(function(event) {
                event.preventDefault();
                $('html, body').animate({scrollTop: 0}, duration);
                })
            });

        });
        $scope.headerClick = function() {
            $state.go('home');
        }
    }
]);

/* Footer Controller */
app.controller('FooterCtrl', ['$scope',
    function($scope) {

    }
]);