
module.exports.movieNews = function () {
    var request = require('request');
    var finalPost = [];
    var option = {
        url: 'https://api.themoviedb.org/3/movie/upcoming',
        qs: {
            api_key: '0478ceb0e5f2d5cfa42ec1f989eba2d8',
            region: 'IN'
        }
    };
    var requiredObj = {
        title: 'title',
        excerpt: 'excerpt',
        content: 'content',
        termNames: {
            "category": [''],
            "post_tag": ['']
        },
        media_urls: ['media_urls'],
        status: 'publish'
    }
    return new Promise(function (resolve, reject) {
        request(option, function (error, response) {
            if (error) {
                reject(error);
            }
            resolve(response);// Print the HTML for clsthe Google homepage.
        });
    })
        .then(function (response) {
            console.log(JSON.parse(response.body).results);
            var mov = JSON.parse(response.body).results;
            mov.forEach(function (item) {
                requiredObj.title = item.title;
                requiredObj.excerpt = 'Release Date' + item.release_date
                requiredObj.content = '<p> A Rated(18+): ' + item.adult + '/p><p>Popularity: ' + item.popularity + '</p><p>Overview: ' + item.overview + '</p>',
                    requiredObj.termNames.category = ['Indian Movie', 'Upcoming Movie'];
                requiredObj.termNames.post_tag = ['Indian Movie', 'Upcoming Movie'];
                finalPost.push({
                    title: item.title,
                    excerpt: 'Release Date' + item.release_date,
                    content: '<p> A Rated(18+): ' + item.adult + '/p><p>Popularity: ' + item.popularity + '</p><p>Overview: ' + item.overview + '</p>',
                    termNames: {
                        category: ['Indian Movie', 'Upcoming Movie'],
                        post_tag: ['Indian Movie', 'Upcoming Movie']
                    },
                    status: 'publish'
                });
            });
            console.log(finalPost.length);
            option.url = 'https://api.themoviedb.org/3/movie/top_rated';
            return new Promise(function (resolve, reject) {
                return request(option, function (error, response) {
                    resolve(response);// Print the HTML for the Google homepage.
                });
            })
        })
        .then(function (response) {
            var mov = JSON.parse(response.body).results;
            mov.forEach(function (item) {
                finalPost.push({
                    title: item.title,
                    excerpt: 'Release Date' + item.release_date,
                    content: '<p> A Rated(18+): ' + item.adult + '/p><p>Popularity: ' + item.popularity + '</p><p>Overview: ' + item.overview + '</p>',
                    termNames: {
                        category: ['Indian Movie', 'Upcoming Movie'],
                        post_tag: ['Indian Movie', 'Upcoming Movie']
                    },
                    status: 'publish'
                });
            });
            console.log(finalPost.length);
            option.url = 'https://api.themoviedb.org/3/movie/popular';
            return new Promise(function (resolve, reject) {
                return request(option, function (error, response) {
                    resolve(response);// Print the HTML for the Google homepage.
                });
            })
        })
        .then(function (response) {
            var mov = JSON.parse(response.body).results;
            mov.forEach(function (item) {
                finalPost.push({
                    title: item.title,
                    excerpt: 'Release Date' + item.release_date,
                    content: '<p> A Rated(18+): ' + item.adult + '/p><p>Popularity: ' + item.popularity + '</p><p>Overview: ' + item.overview + '</p>',
                    termNames: {
                        category: ['Indian Movie', 'Upcoming Movie'],
                        post_tag: ['Indian Movie', 'Upcoming Movie']
                    },
                    status: 'publish'
                });
            });
            console.log(finalPost.length);
            console.log(JSON.stringify(finalPost));
            var wordpress = require("wordpress");
            var client = wordpress.createClient({
                url: "http://proxap.in/",
                username: "admin",
                password: "a2XjCa$X$3"
            });
            return createPost(finalPost, client)
        })
        .catch(function (err) {
            return err;
        })

    function createPost(content, client) {
        if (content.length == 0) {
            console.log('All Post created!!');
            return;
        }
        console.log('Creating POST to Wordpress..');
        var fs = require('fs'),
            request = require('request');
        var post = content.pop();
        var contentType;
        var req = {
            // "title" and "content" are the only required properties
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            //  tags: response.articles[0].source.name,
            //author: post.source.name,
            /*  categories: [
                  response.articles[0].source.name
              ],*/
            //  featured_media: response.articles[0].urlToImage,
            termNames: {
                "category": post.termNames.category,
                "post_tag": post.termNames.tags
            },
            media_urls: [''],
            // Post will be created as a draft by default if a specific "status"
            // is not specified
            status: post.status
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
                console.log('Post added: ' + req.title);
                resolve(posts);
            })

        })
            // })

            //   })
            .then(function () {
                return createPost(content, client);
            })
            .catch(function (err) {
                console.log('Error:' + err);
                var wordpress = require("wordpress");
                client = wordpress.createClient({
                    url: "http://proxap.in/",
                    username: "admin",
                    password: "a2XjCa$X$3"
                });
                return createPost(content, client);
            })
    }
}
