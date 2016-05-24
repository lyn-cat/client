"/*\n * REST Resource: v1/static/:menu_entry\n *\n * URL for this resource: http://lyncat.corus.io/custom/dev_lyncat/v1/static/:menu_entry\n *\n */\n\nvar Corus \t\t\t\t= require('corus'),\n    async\t\t\t\t= require('async'),\n    moment\t\t\t\t= require('moment'),\n\tlang \t\t\t\t= req.query.lang || req.headers.lang || req.cookies.lang || null,\n\tcorus \t\t\t\t= new Corus({host: process.env.HOST, key: process.env.KEY, avoidTrigger: true, lang: lang, fillWithDefaultLang: true}),\n    filter\t\t\t\t= {\n        where: \t\t{\n\t\t\tmenu_entry:\t\treq.params.menu_entry\n        },\n        count:\t\tfalse\n    },\n    children_filter\t\t= {\n        where: \t\t{\n\t\t\tparent:\t\t\tnull\n        },\n        order:\t\t'order',\n        count:\t\tfalse\n    },\n    collection\t\t\t= 'static_entries',\n    imagesCollection \t= 'images_entries_static',\n\tactionsCollection \t= 'actions_entries_static',\n\tfilesCollection \t= 'files_entries_static',\n    response\t\t\t= null;\n\n\n\nif (req.method === 'GET') {\n\n    async.waterfall(\n        [\n            function(icallback) {\n\n                corus.apps(process.env.APP).collections(collection).data().get(filter, function(err, result){\n                    \n                    if (!err && result.array && result.array.length === 1){\n                        \n                        delete result.array[0]._title;\n                        delete result.array[0]._subTitle;\n                        delete result.array[0].createdOn;\n                        delete result.array[0].createdBy;\n                        delete result.array[0].modifiedBy;\n                        response = result.array[0];\n                        response.images = [];\n                        response.actions = [];\n                        response.files = [];\n                        \n                        response.body = response.body.replace(/\\!\\[(.*)\\]\\((.*)\\)/gm, function(a){\n                            \n                            if (a.match(/http:\\/\\/|https:\\/\\//gm)){\n                                return a;\n                            } else {\n                                return a.replace(/\\!\\[(.*)\\]\\((.*)\\)/gm, '![$1](https://' + process.env.HOST + '/api/v1/apps/' + process.env.APP + '/collections/' + collection + '/data/' + response.id + '/body/$2)');\n                            }\n\n\t\t\t\t\t\t});\n                        \n                        children_filter.where.parent = response.id;\n\t                    icallback(err);\n                        \n                    } else {\n\t                    icallback('Not found.');\n                    }\n                    \n                });\n\n            },\n            function(icallback) {\n                \n                // Get related Images\n                corus.apps(process.env.APP).collections(imagesCollection).data().get(children_filter, function(err, result){\n                    \n                    if (!err && result.array && result.array.length > 0){\n                        \n                        result.array.forEach(function(i){\n                            response.images.push({\n                                parent:\t\ti.parent,\n                                url: \t\t'https://' + process.env.HOST + '/api/v1/apps/' + process.env.APP + '/collections/' + imagesCollection + '/data/' + i.id + '/image',\n                                caption:\ti.caption,\n                                order:\t\ti.order\n                            });\n                        });\n                        \n                    }\n\n                    icallback(err);\n                    \n                });\n                \n            },\n            function(icallback) {\n                \n                // Get related Files\n                corus.apps(process.env.APP).collections(filesCollection).data().get(children_filter, function(err, result){\n                    \n                    if (!err && result.array && result.array.length > 0){\n                        \n                        result.array.forEach(function(i){\n                            response.files.push({\n                                parent:\t\t\ti.parent,\n                                file: \t\t\t'https://' + process.env.HOST + '/api/v1/apps/' + process.env.APP + '/collections/' + filesCollection + '/data/' + i.id + '/file',\n                                title:\t\t\ti.title,\n                                description:\ti.description,\n                                order:\t\t\ti.order\n                            });\n                        });\n                        \n                    }\n\n                    icallback(err);\n                    \n                });\n                \n            },\n            function(icallback) {\n                \n                // Get related Actions\n                corus.apps(process.env.APP).collections(actionsCollection).data().get(children_filter, function(err, result){\n                    \n                    if (!err && result.array && result.array.length > 0){\n                        \n                        result.array.forEach(function(i){\n                            response.actions.push({\n                                parent:\t\ti.parent,\n                                action: \ti.action,\n                                link:\t\ti.link,\n                                order:\t\ti.order\n                            });\n                        });\n                        \n                    }\n\n                    icallback(err);\n                    \n                });\n                \n            }\n        ],\n        function(error){\n            next(error, response);\n        }\n\n    );\n\n} else {\n\n    next({statusCode: 400, message: 'Invalid HTTP verb: ' + req.method});\n\n}"
