# Collaborative-Story-Viz

Done last summer

A Collaborative Story Visualisation site where people input one sentence to the running story. We will visualise how the text of the story evolves, i.e. sentiment, nouns... 

### Getting Started
```
git clone
mkdir data
cd story && npm install
```

To run the MongoDB database, `./mongod`. 

To run the app, `cd story && npm start`. 

### Screenshots

### Resources

#### MEAN Stack Tutorials
* [Node-Express-Mondo](http://cwbuecheler.com/web/tutorials/2013/node-express-mongo/)
* [Tutorial on MEAN stack](https://thinkster.io/mean-stack-tutorial)
* [Scotch.io](https://scotch.io/tutorials/use-ejs-to-template-your-node-application)
* [Scotch.io FileUploader](https://scotch.io/tutorials/build-a-mean-stack-file-uploader-app-with-filestack)
* [Angular UI Bootstrap](https://angular-ui.github.io/bootstrap/)

#### Analytics Libraries 
* [Microsoft Cognitive Services](https://www.microsoft.com/cognitive-services/en-us/text-analytics-api)
* [nlp-compromise](https://github.com/nlp-compromise/nlp_compromise)
* [IBM Watson](http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/services-catalog.html)
* [IBM Watson Node SDK](https://github.com/watson-developer-cloud/node-sdk#alchemy-language)

#### Visualisation Libraries
* [d3.js](https://d3js.org)
* [Chart.js](http://www.chartjs.org/)
* [AngularJS and d3](https://www.sitepoint.com/creating-charting-directives-using-angularjs-d3-js/)

### JS/CSS Resources
* [Flags of all countries](https://github.com/lafeber/world-flags-sprite)
* [GeoIP](https://github.com/fiorix/freegeoip)
* [Google Recaptcha](http://www.codedodle.com/2014/12/google-new-recaptcha-using-javascript.html)

curl -v -X POST "https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment" -H "Content-Type: application/json" -H "Ocp-Apim-Subscription-Key: " --data-ascii "{\"documents\": [{ \"language\": \"en\", \"id\": \"string\", \"text\": \"string\" }]}"
curl -v -X POST "https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment" -H "Content-Type: application/json" -H "Ocp-Apim-Subscription-Key: " --data "{\"documents\": [{ \"language\": \"en\", \"id\": \"string\", \"text\": \"string\" }]}"

