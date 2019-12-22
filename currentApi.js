module.exports.nationalNews = function () {
    const CurrentsAPI = require('currentsapi');
    const currentsapi = new CurrentsAPI('sSLjPypWDAV3JI0FGYJzJCfG1y-6iIafZNLZ5TaLZzU9XTBb');
    var hours = new Date().getHours() - 12;
    var month = new Date().getUTCMonth() + 1;
    var from = new Date().getUTCFullYear() + '-' + month + '-' + new Date().getUTCDate() + 'T' + hours + ':' + new Date().getUTCMinutes() + ':' + new Date().getUTCSeconds();
    currentsapi.search({
        keywords: '',
        language: 'en',
        country: 'IN',
        type: 1,
        start_date: from
    }).then(response => {
        console.log(response);
        var wordpress = require("wordpress");
        var client = wordpress.createClient({
            url: "http://proxap.in/",
            username: "admin",
            password: "a2XjCa$X$3"
        });
        loadPostInwordPress(response.news, 'National', client)
        /*
          {
            status: "ok",
            news: [...]
          }
        */
    });

    function loadPostInwordPress(content, category, client) {
        console.log('Creating POST to Wordpress..');
        var fs = require('fs'),
            request = require('request');
        if (content.length == 0) {
            return;
        }
        var post = content.pop();
        var contentToPost = post.description.substring(0, 250);
        var contentType;
        var req = {
            // "title" and "content" are the only required properties
            title: post.title,
            excerpt: post.author,
            content: '<p>' + contentToPost + '....</p>' + '<p> For complete news please follow article link on <a href="' + post.url + '">' + post.author + '</a></p><p> Category: ' + category + '</p>',
            //  tags: response.articles[0].source.name,
            //author: post.source.name,
            /*  categories: [
                  response.articles[0].source.name
              ],*/
            //  featured_media: response.articles[0].urlToImage,
            termNames: {
                "category": [category],
                "post_tag": [category]
            },
            media_urls: post.image,
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
}