
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('156ecc3cec95403a9cead389cfa4360a');
function startImport(category) {
    // To query /v2/top-headlines
    // All options passed to topHeadlines are optional, but you need to include at least one of them
    return newsapi.v2.sources({})
        .then(function (response) {
            var enSource = response.sources.filter(function (item) {
                return item.language == 'en' && item.category == category.category;
            })
            var sources = enSource.map(function (item) {
                return item.id;
            })
            var hours = new Date().getHours() - 4;
            var month = new Date().getUTCMonth() + 1;
            var from = new Date().getUTCFullYear() + '-' + month + '-' + new Date().getUTCDate() + 'T' + hours + ':' + new Date().getUTCMinutes() + ':' + new Date().getUTCSeconds();
            return callNewsApi(sources, from, 1, category);
        })
        .then(function (response) {

        })
        .catch(function (err) {
            console.log(err);
        })
}
var categories = [
    {
        category: 'technology',
        id: 8
    },
    {
        category: 'business',
        id: 2
    },
    {
        category: 'entertainment',
        id: 3
    },
    {
        category: 'sports',
        id: 7
    },
    {
        category: 'general',
        id: 6
    },
    {
        category: 'health',
        id: 5
    },
    {
        category: 'science',
        id: 6
    }

]
//avoid heruku error
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));


//For avoidong Heroku $PORT error
app.get('/', function (request, response) {
    var result = 'App is running'
    response.send(result);
}).listen(app.get('port'), function () {
    console.log('App is running, server is listening on port ', app.get('port'));
    return national.nationalNews()
        .then(function () {
            return googleNews.googleNews();
        })
        .then(function () {
            return importContent(categories);
        })
        .then(function () {
            return hacker.hackerNews();
        })
});

var national = require('./currentApi');
var googleNews = require('./googleNews');
var hacker = require('./hackerNews');

function importContent(cat) {
    if (cat.length == 0) {
        return;
    }
    var category = categories.pop();
    return startImport(category)
        .then(function () {
            return importContent(cat);
        })
        .catch(function (err) {
            return;
        });
};

function loadPostInwordPress(content, category, client) {
    console.log('Creating POST to Wordpress..');
    var fs = require('fs'),
        request = require('request');
    if (content.length == 0) {
        return;
    }
    var post = content.pop();
    var contentToPost = post.content.substring(0, 250);
    var file = post.source.name + '_' + Math.random() * 1000000 + new Date().getMilliseconds();
    var filename = './download/' + file;
    var contentType;
    var req = {
        // "title" and "content" are the only required properties
        title: post.title,
        excerpt: post.source.name,
        content: '<p>' + contentToPost + '....</p>' + '<p> For complete news please follow article link on <a href="' + post.url + '">' + post.source.name + '</a></p><p> Category: ' + category.category + '</p>',
        //  tags: response.articles[0].source.name,
        //author: post.source.name,
        /*  categories: [
              response.articles[0].source.name
          ],*/
        //  featured_media: response.articles[0].urlToImage,
        termNames: {
            "category": [category.category],
            "post_tag": [category.category, post.source.name]
        },
        media_urls: [post.urlToImage],
        // Post will be created as a draft by default if a specific "status"
        // is not specified
        status: 'publish'
    }
    console.log(req);
    /*   var uri = post.urlToImage;
       return new Promise(function (resolve, reject) {
           return request.head(uri, function (err, res, body) {
               console.log('content-type:', res.headers['content-type']);
               console.log('content-length:', res.headers['content-length']);
               return request(uri).pipe(fs.createWriteStream(filename + res.headers['content-type'].replace('image/', '.'))).on('close', function (result) {
                   resolve(result)
               });
           });
       })
           .then(function (response) {
               var type;
               if (post.urlToImage.split('jpg').length >= 2) {
                   type = 'jpeg'
               }
               else if (post.urlToImage.split('png').length >= 2) {
                   type = 'png'
               }
               var readStream = fs.readFileSync(filename + '.' + type);
               var data = {
                   name: file + '.' + type,
                   type: type,
                   bits: readStream
               };
               console.log(data);*/
    return new Promise(function (resolve, reject) {
        //   return client.uploadFile(data, function (response) {
        //      req.featured_media = 3; 
        return client.newPost(req, function (error, posts) {
            if (error) {
                reject(error);
            }
            console.log('Post added!!');
            resolve(posts);
        })

    })
        // })

        //   })
        .then(function () {
            return loadPostInwordPress(content, category, client);
        })
        .catch(function (err) {
            console.log('Error:' + err);
            return loadPostInwordPress(content, category, client);
        })
}

function callNewsApi(sources, from, page, category) {
    var totalHits;
    return newsapi.v2.everything({
        from: from,
        sortBy: 'popularity',
        sources: sources,
        pageSize: 100
    })
        .then(function (response) {
            console.log('Received Items: ' + response.totalResults);
            totalHits = response.totalResults;
            var wordpress = require("wordpress");
            var client = wordpress.createClient({
                url: "https://proxap.in/",
                username: "admin",
                password: "a2XjCa$X$3"
            });
            return loadPostInwordPress(response.articles, category, client);
        })
        .then(function () {
            if ((totalHits / 100) > page && page < 2) {
                return callNewsApi(sources, from, page + 1, category);
            }
            else {
                return;
            }
        })
        .catch(function (err) {
            console.log(err);
            return;
        })
}