/*
 * Module: surveys
 *
 * Example of custom_module require:
 *
 * var surveys = require('/custom_modules/surveys');
 *
 */

var async = require('async');

exports.updateQuestionResults = function(corus, question, callback){

    async.waterfall(
        [
            function(icallback){

                var question_filter = {
                    where: 		{
                        question: question
                    },
                    limit:		1000000000,
                    count:		false
                };

                // Cerquem la pregunta sobre la que s'ha variat el resultat
                corus.apps(process.env.APP).collections('surveys_results').data().get(question_filter, function(err, result){
                    icallback(err, result.array);
                });

            },
            function(question_results, icallback){

                var average = 0,
                    total = 0;

                if (question_results && question_results.length > 0){

                    question_results.forEach(function(vote){
                        total = total + parseInt(vote.rating, 10);
                    });

                    average = total / question_results.length;

                }

                icallback(null, average, question_results.length);

            },
            function(average, total_votes, icallback){

                // Guardem la mitja a la pregunta
                corus.apps(process.env.APP).collections('surveys_questions').data(question).put({ average_rating: average }, function(err, item){
                    icallback(err, average, total_votes);
                });

            }
        ],
        function(error, average, total_votes){

            if (callback && typeof(callback) === 'function'){
                callback(error, average, total_votes);
            }

        }
    );

};

exports.updateSurveyResults = function(corus, survey, callback){

    async.waterfall(
        [
            function(icallback){

                var survey_filter = {
                    where: 		{
                        parent: survey
                    },
                    limit:		100,
                    count:		false
                };

                // Cerquem les preguntes de l'enquesta
                corus.apps(process.env.APP).collections('surveys_questions').data().get(survey_filter, function(err, result){
                    icallback(err, result.array);
                });

            },
            function(questions, icallback){

                var average 			= 0,
                    total_questions 	= 0,
                    total_votes			= 0,
                    total 				= 0;

                if (questions && questions.length > 0){

                    total_questions = questions.length;

                    async.whilst(
                        function () { return questions.length > 0; },
                        function (jcallback) {

                            var q = questions.shift();

                            exports.updateQuestionResults(corus, q.id, function(err, question_average, question_votes){

                                total = total + question_average;

                                if (question_votes > total_votes){
                                    total_votes = question_votes;
                                }

                                jcallback(err);

                            });

                        },
                        function (err) {

                            if (!err){
                                average = total / total_questions;
                            }

                            icallback(err, average, total_votes);
                        }
                    );

                } else {
                    icallback(null, 0, 0);
                }

            },
            function(average, total_votes, icallback){

                // Guardem la mitja a l'enquesta
                corus.apps(process.env.APP).collections('surveys_entries').data(survey).put({ average_rating: average, total_votes: total_votes }, function(err, item){
                    icallback(err, average);
                });

            }
        ],
        function(error, average){

            if (callback && typeof(callback) === 'function'){
                callback(error, average);
            }

        }
    );

};