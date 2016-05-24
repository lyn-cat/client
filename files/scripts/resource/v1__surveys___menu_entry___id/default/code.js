"/*\n * REST Resource: v1/surveys/:menu_entry/:id\n *\n * URL for this resource: http://lyncat.corus.io/custom/dev_lyncat/v1/surveys/:menu_entry/:id\n *\n */\n\nvar Corus \t\t\t\t= require('corus'),\n    async\t\t\t\t= require('async'),\n    moment\t\t\t\t= require('moment'),\n\tlang \t\t\t\t= null,\n\tcorus \t\t\t\t= new Corus({host: process.env.HOST, key: process.env.KEY, avoidTrigger: true, lang: lang, fillWithDefaultLang: true}),\n    jsonBody;\n\n\n\nif (req.method === 'GET') {\n\n    next(null, {});\n\n} else if (req.method === 'POST') {\n\n    jsonBody = JSON.parse(req.body);\n    \n    if (jsonBody.questions){\n        \n        async.waterfall(\n            [\n                function(icallback) {\n                    \n                    // We save each question result\n                    var questions = jsonBody.questions.slice();\n\n                    async.whilst(\n                        function () { return questions.length > 0; },\n                        function (jcallback) {\n                            \n                            var q \t\t= questions.shift(),\n                                entry \t= {\n                                    device:\t\treq.headers.device,\n                                    survey:     req.params.id,\n                                    question:   q.id,\n                                    rating:     q.rating,\n                                };\n                            \n                            corus.apps(process.env.APP).collections('surveys_results').data().post(entry, function(err, item){\n\t\t\t\t\t\t\t\tjcallback(err);\n                            });\n\n                        },\n                        function (err) {\n                            icallback(err);\n                        }\n                    );\n\n                },\n                function(icallback) {\n\n                    // Update the survey results\n                    require('/custom_modules/surveys').updateSurveyResults(corus, req.params.id, function(err){\n                        icallback(err);\n                    });\n\n                }\n            ],\n            function(error){\n                next(error);\n            }\n        );\n        \n    } else {\n        next('Missing questions results.');\n    }\n\n} else {\n\n    next({statusCode: 400, message: 'Invalid HTTP verb: ' + req.method});\n\n}\n\n"
