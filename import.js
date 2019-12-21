
function startImport(category) {
    const NewsAPI = require('newsapi');
    const newsapi = new NewsAPI('84ceeae538484b96a2d7bdddb0788353');
    // To query /v2/top-headlines
    // All options passed to topHeadlines are optional, but you need to include at least one of them
    return newsapi.v2.sources({})
        .then(function (response) {
            var enSource = response.sources.filter(function (item) {
                return item.language == 'en' && item.category == category.category
            })
            var sources = enSource.map(function (item) {
                return item.id;
            })
            var hours = new Date().getHours() - 24;
            var month = new Date().getUTCMonth() + 1;
            var from = new Date().getUTCFullYear() + '-' + month + '-' + new Date().getUTCDate() + 'T' + hours + ':' + new Date().getUTCMinutes() + ':' + new Date().getUTCSeconds();
            console.log('Fetching results from: ' + from);
            return newsapi.v2.everything({
                sources: sources,
                from: from
            });
        })
        .then(function (response) {
            console.log('Received Items: ' + response.totalResults);
            var wordpress = require("wordpress");
            var client = wordpress.createClient({
                url: "https://proxap.in/",
                username: "admin",
                password: "a2XjCa$X$3"
            });
            return loadPostInwordPress(response.articles, category, client);
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
        id: 8
    },
    {
        category: 'entertainment',
        id: 8
    },
    {
        category: 'sports',
        id: 8
    }

]
var cron = require('node-cron');
importContent(categories);
cron.schedule('* * 24 * *', () => {
    importContent(categories);
});

function importContent(cat) {
    if (cat.length == 0) {
        return;
    }
    var category = categories.pop();
    return startImport(category)
        .then(function () {
            return importContent(cat);
        })
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
        excerpt: '<p>Post by: ' + post.source.name + '</p><p>' + post.description + '</p>',
        content: '<p>' + contentToPost + '....</p>' + '<p> For complete news please follow article link on <a href="' + post.url + '">' + post.source.name + '</a></p><p> Category: ' + category.category + '</p>',
        //  tags: response.articles[0].source.name,
        //  author: response.articles[0].source.name,
        link: post.url,
        /*  categories: [
              response.articles[0].source.name
          ],*/
        //  featured_media: response.articles[0].urlToImage,
        categories: [category.id],
        // Post will be created as a draft by default if a specific "status"
        // is not specified
        status: 'publish'
    }
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