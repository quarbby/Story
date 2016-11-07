### RESTful APIs Endpoints

Note: Feel free to let me know if I should change something
The APIs are written in `public/routes/index.js`.

| Endpoint      | Method   | Params | Description  |
| ------------- |---------------| --------| ------|
| /watson/sentiment    | GET | {text: String} | Get Sentiment of text string via IBM Watson API |
| /sentences     | GET      |    | Get all sentences |
| /sentences | POST      |   {text: String, sentiment: String, labelColor: String, countryCode: String} | Create new sentence |