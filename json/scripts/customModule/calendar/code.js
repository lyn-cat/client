/*
 * Module: calendar
 *
 * Example of custom_module require:
 *
 * var calendar = require('/custom_modules/calendar');
 *
 * Versión: 1.0 => First Commit
 *
 */

var async = require('async');



exports.updateEntryRating = function(corus, calendar_entry, callback){

    async.waterfall(
        [
            function(icallback){

                var ratings_filter = {
                    where: 		{
                        parent: calendar_entry
                    },
                    limit:		1000000000,
                    count:		false
                };

                // Cerquem els ratings de l'apunt del calendari
                corus.apps(process.env.APP).collections('calendar_entries_rating').data().get(ratings_filter, function(err, result){
                    icallback(err, result.array);
                });

            },
            function(rating_results, icallback){

                var average = 0,
                    total = 0;

                if (rating_results && rating_results.length > 0){

                    rating_results.forEach(function(vote){
                        total = total + parseInt(vote.rating, 10);
                    });

                    average = total / rating_results.length;

                }

                icallback(null, average, rating_results.length);

            },
            function(average, total_votes, icallback){

                // Guardem el promig
                corus.apps(process.env.APP).collections('calendar_entries').data(calendar_entry).put({ average_rating: average, total_votes: total_votes }, function(err, item){
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