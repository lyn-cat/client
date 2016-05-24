"/*\n * REST Resource: v1/news/:menu_entry/categories\n *\n * URL for this resource: http://lyncat.corus.io/custom/dev_lyncat/v1/news/:menu_entry/categories\n *\n */\n\nvar Corus \t\t\t\t= require('corus'),\n    async\t\t\t\t= require('async'),\n    moment\t\t\t\t= require('moment'),\n\tlang \t\t\t\t= req.query.lang || req.headers.lang || req.cookies.lang || null,\n\tcorus \t\t\t\t= new Corus({host: process.env.HOST, key: process.env.KEY, avoidTrigger: true, lang: lang, fillWithDefaultLang: true}),\n    filter\t\t\t\t= {\n        where: \t\t{\n            menu_entry:\treq.params.menu_entry\n        },\n        order:\t\t'order',\n        skip:\t\tnull,\n        limit:\t\tnull,\n        count:\t\tfalse\n    },\n    collection\t\t\t= 'news_categories';\n\nif (req.method === 'GET') {\n\n    if (req.query && req.query.skip !== undefined && req.query.skip !== null){\n        filter.skip = req.query.skip;\n    }\n    \n    if (req.query && req.query.limit !== undefined && req.query.limit !== null){\n        filter.limit = req.query.limit;\n    } else {\n        filter.limit = 50;\n    }\n\n    async.waterfall(\n        [\n            function(icallback) {\n\n                corus.apps(process.env.APP).collections(collection).data().get(filter, function(err, result){\n                    \n                    if (!err && result.array && result.array.length > 0){\n                        \n                        result.array = result.array.map(function(i){\n                            \n                            delete i._title;\n                            delete i._subTitle;\n                            delete i.createdOn;\n                            delete i.createdBy;\n                            delete i.modifiedBy;\n                            \n\t\t\t\t\t\t\treturn i;\n                            \n                        });\n\n                    }\n                    \n                    icallback(null, result);\n                    \n                });\n\n            }\n        ],\n        function(error, response){\n            next(error, response);\n        }\n\n    );\n\n} else {\n\n    next({statusCode: 400, message: 'Invalid HTTP verb: ' + req.method});\n\n}\n\n"