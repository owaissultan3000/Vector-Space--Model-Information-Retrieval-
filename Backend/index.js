const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
var lemmatizer = require('lemmatizer');
const app = express();
const Router = express.Router();

app.use(cors());
app.use(logger(`dev`));
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: false }));

var stopwords = []
var positionalindex = {}
var saved_flag = 0
// Routes
app.use(
  Router.get("/getResult", async (req, res) => {
    let query = req.query.query;
    var cutoffvalue = req.query.a_value;
    if (cutoffvalue === undefined)
    {
      cutoffvalue = 0.005
      }
    console.log(cutoffvalue)


     //loading of stop words in to the list
    var path = "./Files/Stopword-List.txt";
    var stdata = fs.readFileSync(path, "utf8").split("\n");

    for (var i = 0; i < stdata.length; i++) {
      temp = stdata[i].replace("\r", "").replace(" ", "").toString();
      stopwords.push(temp);
}
    
//calling of file creation method   
filechecking();
setTimeout(() => {

Query = query
Query = Query.trim()
Query = Query.split(" ")
query_ = []

for (var i = 0; i < Query.length; i++)
{
    if (stopwords.includes(Query[i]) === false)
    {
        data = lemmatizer.lemmatizer(Query[i])
        

        if (data === undefined)
        {
                positionalindex[data] = {}

                for (var k = 1; k <= 50; k++)
                {
                    positionalindex[data[i]][k] = 0
                }
            
        }
        query_.push (data)
    }
       
    }
    
    VSM(query_,cutoffvalue)
    
},3000)

function indexing() {
        //Positional Index Creation
    
        for (var i = 1; i <= 50; i++) {
            var filepath = './Files/'
            var filename = filepath + i.toString() + '.txt'
            var data = fs.readFileSync(filename, 'utf8').split('\n')
            data = data.toString().toLowerCase().replace(/[\n\r]+/g, ' ').replace(",", "");
            data = data.split(' ')

            for (j = 0; j < (data.length); j++) {
                var temp = data[j].replace(',', "").replace('.', "").replace(" ", "").replace("\n", "").replace("?", "").replace("!", "")
                    .replace(",", "").replace("]", "").replace("[", "").replace("-", " ").replace("’s", "").replace("''", "")
                    .replace(";", "").replace("''", "").replace("——", "").replace("—", "").replace(":", "").replace("n’t", " not").replace("\n", "")
                    .replace("’ll", "will").replace("’m", " am").replace(/“/g, '').replace(/”/g, '').replace(/‘/g, '').replace(/’/g, '').replace(/''/g, '')
                    .replace("(", "").replace(")", "").toLowerCase()
                // temp = stemmer(temp)
                temp = lemmatizer.lemmatizer(temp)
                //if the token is not in stop word list then add in positionalindex list
                if (stopwords.includes(temp) == false) {
         
                    //if the token is not in position-index list then add the word    
                    if (positionalindex[temp] === undefined) {
                        
                        let count = 1
                        positionalindex[temp] = {}

                        for (var k = 1; k <= 50; k++)
                        {
                            positionalindex[temp][k] = 0
                        }

                        positionalindex[temp][i] = count
                    }
                    // 2 temp "obama"
                    // if doc id is ready in the position-index then add index in the list
                    else if ((positionalindex[temp][i]) !== undefined) {
            
                        let count = positionalindex[temp][i]
           
                        count = count + 1
            
                        positionalindex[temp][i] = count
                    }
             
                    //if doc id is not in the position-index then add the doc id and corresponding position of word in list    
                    else if (!(i.toString() in positionalindex[temp]) == true) {
                        let count = 1
                        positionalindex[temp][i] = count
                    }

                }
            }
    }

}

async function filechecking() {
      fs.readFile("./Files/positional.txt", (err, data) => {
          if (err) {
              
              saved_flag = 1
          indexing(); //creation of new positional index if not in directory
          } else {
                saved_flag = 0
              positionalindex = JSON.parse(data);
        }
      });
       
}

function VSM(query_,cutoffvalue) {
    console.log(query_)
    var words = []
    var count = 0
    words = Object.keys(positionalindex)
    query_vector = {}

    for (var i = 0; i < query_.length; i++) {
        for (var j = 0; j < words.length; j++) {
            if (query_vector[words[j]] === undefined && query_[i] == words[j]) {
                query_vector[words[j]] = 1
            
            }
            else if (query_vector[words[j]] !== undefined && query_[i] == words[j]) {
                query_vector[words[j]] = query_vector[words[j]] + 1
            }
            else if (query_vector[words[j]] === undefined) {
                query_vector[words[j]] = 0
            }
        }
    }

    if(saved_flag == 1){
    //count number of docs in which words is used and idf calculation
    for (var i = 0; i < words.length; i++) {

        for (var j = 1; j < 50; j++) {
            if (positionalindex[words[i]][j.toString()] > 0) {
                count += 1
            }
        }
        positionalindex[words[i]]['active'] = count;

        positionalindex[words[i]]['idf'] = Number(((Math.log2(count)) / 50).toFixed(3));

        count = 0
    }

    //query tf idf
    for (var i = 0; i < query_.length; i++) {
        if (query_[i] !== undefined)
            query_vector[query_[i]] = query_vector[query_[i]] * positionalindex[query_[i]]['idf']
    }


    //docs tf idf
    for (var i = 0; i < words.length; i++) {
    
        for (var j = 1; j <= 50; j++) {

            if (positionalindex[words[i]][j.toString()] !== undefined) {
                positionalindex[words[i]][j.toString()] = Number((Number(positionalindex[words[i]][j.toString()]) * Number(positionalindex[words[i]]['idf'])))

            }
        
        }
    }
    
        //saving of index in txt file for future use
        fs.writeFileSync(
            "./Files/positional.txt",
            JSON.stringify(positionalindex))
    }
    var vector = {}

    for (var i = 1; i <= 50; i++) {

        var vec = []
        vector[i] = null
        for (var j = 0; j < words.length; j++) {

            if (positionalindex[words[j]][i.toString()] !== undefined) {

                vec.push(Number(positionalindex[words[j]][i.toString()]))
            }

        }
        vector[i] = vec
        vec = []
    
    }

    var doc_mod = {}
    var query_mod = 0
    var sum = 0
    for (var j = 1; j <= 50; j++) {
    

        for (var i = 0; i < vector[j.toString()].length; i++) {
        
            if (isNaN((vector[j.toString()][i]) == true)) {
                vector[j.toString()][i] = 0
              
            }
            sum = sum + Number(vector[j.toString()][i] * vector[j.toString()][i])
        
        
        }
        doc_mod[j] = Number(Math.sqrt(sum))
   
        sum = 0
    
    }


    sum = 0
    for (var i = 0; i < Object.values(query_vector).length; i++) {

        sum = sum + (query_vector[words[i]] * query_vector[words[i]])
    
    }
    query_mod = Math.sqrt(sum).toFixed(2)
    query_vector = Object.values(query_vector)


    var vector_product = {}
    var product = 0
    for (var i = 1; i <= 50; i++) {
        for (var j = 0; j < words.length; j++) {

            product = product + (vector[i.toString()][j] * query_vector[j])
        

        }
        vector_product[i] = product
        product = 0
    }
    var result_doc = []
    console.log("\nResults:\n")
    for (var i = 1; i <= 50; i++) {

      if ((vector_product[i.toString()] / (query_mod * doc_mod[i.toString()])) > (cutoffvalue / 10))
      {
                    // result_doc[i] = (vector_product[i.toString()] / (query_mod * doc_mod[i.toString()]))
                    result_doc.push(i)
        
          }

  }
  console.log(result_doc)
  return res.status(200).json(result_doc);
}
    
}));

// Change the port if you want
let Port = 3001;
app.listen(Port, () => {
  console.log(`Server is running on port ${Port} `);
});