"/*\n * REST Resource: v1/me\n *\n * URL for this resource: http://lyncat.corus.io/custom/dev_lyncat/v1/me\n *\n */\n\nvar Corus \t\t= require('corus'),\n    async\t\t= require('async'),\n    moment\t\t= require('moment'),\n\tlang \t\t= null,\n\tcorus \t\t= new Corus({host: process.env.HOST, key: process.env.KEY, avoidTrigger: true, lang: null, fillWithDefaultLang: true}),\n    jsonBody;\n\n\n\nif (req.method === 'GET') {\n\n    async.waterfall(\n        [\n            function(icallback){\n\n                // Get user profile\n                corus.users(req.user.email).get(function(err, user){\n                    \n                    if (!err && user){\n                        user.avatar = 'https://' + process.env.HOST + '/api/v1/users/' + req.user.email + '/avatar';\n                    }\n                    \n                    icallback(err, user);\n                    \n                });\n\n            }\n        ],\n        function(error, user){\n            next(error, user);\n        }\n    );\n\n} else {\n\n    next({statusCode: 400, message: 'Invalid HTTP verb: ' + req.method});\n\n}"
