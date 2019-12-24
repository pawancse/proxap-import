module.exports.googleNews = function () {
    const googleTrends = require('google-trends-api');
    return googleTrends.dailyTrends({ geo: 'IN' })
        .then(function (results) {
            var wordpress = require("wordpress");
            var client = wordpress.createClient({
                url: "http://proxap.in/",
                username: "admin",
                password: "a2XjCa$X$3"
            });
            var result = JSON.parse(results);
            var tags = result.default.trendingSearchesDays[0].trendingSearches[0].relatedQueries.map(function (item) {
                return item.query;
            });
            if (tags.length > 5) {
                tags.length = 5;
            }
            return createPost(result.default.trendingSearchesDays[0].trendingSearches[0].articles, 'National', client, tags);
        })
        .catch(function (err) {
            console.error('Oh no there was an error', err);
        });

    function createPost(content, category, client, tags) {
        console.log('Creating POST to Wordpress..');
        var fs = require('fs'),
            request = require('request');
        if (content.length == 0) {
            return;
        }
        var post = content.pop();
        var contentToPost = post.snippet.substring(0, 250);
        var contentType;
        var req = {
            // "title" and "content" are the only required properties
            title: post.title,
            excerpt: post.source,
            content: '<p>' + contentToPost + '....</p>' + '<p> For complete news please follow article link on <a href="' + post.url + '" target="_blank">' + post.source + '</a></p><p> Category: ' + category + '</p>',
            //  tags: response.articles[0].source.name,
            //author: post.source.name,
            /*  categories: [
                  response.articles[0].source.name
              ],*/
            //  featured_media: response.articles[0].urlToImage,
            termNames: {
                "category": [category],
                "post_tag": tags
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
                return createPost(content, category, client, tags);
            })
            .catch(function (err) {
                console.log('Error:' + err);
                var wordpress = require("wordpress");
                client = wordpress.createClient({
                    url: "https://proxap.in/",
                    username: "admin",
                    password: "a2XjCa$X$3"
                });
                return createPost(content, category, client, tags);
            })
    }
}