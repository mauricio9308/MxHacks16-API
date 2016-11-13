'use strict';

/**
 * Module dependencies
 * */
var Q = require('q');
var path = require('path');
var errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Definition of the possible error codes for the pagination library
 * */
exports.ERROR_CODE_INVALID_PAGE_SIZE = 1;
exports.ERROR_CODE_INVALID_PAGE_INDEX = 2;
exports.ERROR_CODE_CONTENT_NAME_NOT_SET = 2;
exports.ERROR_CODE_FETCH_ERROR = 4;


/**
 * Default page size for the queries
 * */
var DEFAULT_PAGE_SIZE = 12;
exports.DEFAULT_PAGE_SIZE = 12;

/**
 * Processes the model with the given filters and checks the number of the pages that can be generated
 * in base of the provided pageSize.
 * */
function getPagesNumber(Model, filter, pageSize) {
    //Setting the deferred object
    var deferred = Q.defer();

    /* validating if the filter is set */
    var pageCountFilter;
    if( filter ){
        pageCountFilter = filter;
    }else{
        pageCountFilter = {};
    }

    /* getting the item count for the model with the given filter */
    Model.count( pageCountFilter, function(err, total) {
        if (err) {
            /* processing the error in the page count get */
            deferred.reject(err);
        } else {
            /* success obtaining the item count */
            var totalPages = Math.ceil(total / pageSize);

            //The min page number is 1
            if (totalPages === 0){
                totalPages = 1;
            }

            //Resolving the success
            deferred.resolve(totalPages);
        }
    });

    return deferred.promise;
}

/**
 * Checks if the given page number is valid against the total number of pages given.
 * */
exports.isValidPage = function(page, totalPages) {
    if (isNaN(page)) { //The param is not a number
        return false;
    } else {
        /* page number must be greater than 1 and less than de total of pages */
        if (page < 1 || page > totalPages) {
            return false;
        } else {
            return true;
        }
    }
};


/**
 * Checks if the provided page size is a valid value
 * */
exports.isValidPageSize = function(pageSize) {
    if (isNaN(pageSize)) {
        //The param is not a number
        return false;
    } else {
        if (pageSize < 1) {
            //Page size must be greater than 1
            return false;
        } else {
            return true;
        }
    }
};

/**
 * Handling of the error messages from the pagination library in the
 * response level
 * */
exports.handleErrorResult = function( errorResult, res) {
    switch (errorResult.code) {
        case exports.ERROR_CODE_INVALID_PAGE_SIZE:
            console.log('Invalid page size provided');
            res.status(400).send({
                message: 'Invalid page size provided'
            });
            break;
        case exports.ERROR_CODE_INVALID_PAGE_INDEX:
            console.log('Invalid page index provided');
            res.status(400).send({
                message: 'Invalid page index provided'
            });
            break;
        case exports.ERROR_CODE_FETCH_ERROR:
            console.log('Error fetching the data from the database');
            res.status(400).send({
                message: errorResult.content
            });
            break;
        default:
            console.log('Content name not provided');
            res.status(500).send({
                message: 'Internal server error'
            });
            break;
    }
};

/*
 Description: This functions gets paged data from a specified model in a
 specific order.
 Model: The mongo Schema where the query is going to be executed
 query: The query used into the model. Contains filter and select.
 pageSize: The page size
 page: The requested page
 contentName: Name of the attribute that holds the returned object
 */
exports.paginate = function( Model, query, pageNumber, pageSize, contentName ){
    //Creation of the deferred object for the pagination resolve
    var deferred = Q.defer();

    /* validating the set of the current page size*/
    if( !pageSize ){
        // Page size not set, we set the default value
        pageSize = DEFAULT_PAGE_SIZE;
    }else{
        // Validating the current set value
        if( !exports.isValidPageSize( pageSize ) ){
            console.log('Pagination', 'Invalid page size');
            deferred.reject({
                code: exports.ERROR_CODE_INVALID_PAGE_SIZE
            });
            return deferred.promise;
        }
    }

    /* validating the set of the current page number */
    if( !pageNumber || pageNumber < 1 ){
        console.log('Pagination', 'Invalid page number');
        deferred.reject({
            code: exports.ERROR_CODE_INVALID_PAGE_INDEX
        });
        return deferred.promise;
    }

    /* validating that the content name is set */
    if( !contentName ){
        deferred.reject({
            code: exports.ERROR_CODE_CONTENT_NAME_NOT_SET
        });
        return deferred.promise;
    }

    /* doing the query for the page count */
    getPagesNumber( Model, query.filter, pageSize).then(function( totalOfPages ){
        /* validating the page number provided */
        if( exports.isValidPage( pageNumber, totalOfPages) ){
            /* we proceed with the page fetch via the given index */

            //Setting the skip and limit variables
            var skipPageSize = (pageNumber - 1) * pageSize; //Skipping the equivalent of content pages
            var limitPageSize = pageSize; // Limiting the result to the given page size

            //Adding the parameters needed for the pagination to the query call
            query.skip( skipPageSize ).limit( limitPageSize );

            //Executing the pending query
            query.exec( function( err, result ){
                if( err ){
                    console.log('Error executing the final query', err);

                    /* error resolving the pagination query */
                    deferred.reject({
                        code: exports.ERROR_CODE_FETCH_ERROR,
                        content: errorHandler.getErrorMessage( err )
                    });
                }else{
                    /* returning the result of the pagination */
                    var pageInfo = {};
                    pageInfo.totalOfPages = totalOfPages;
                    pageInfo.pageSize = pageSize;
                    pageInfo.pageNumber = pageNumber;
                    pageInfo[contentName] = result;

                    deferred.resolve( pageInfo );
                }
            });
        }else{
            /* invalid page index we cancel the query search */
            deferred.reject({
                code: exports.ERROR_CODE_INVALID_PAGE_INDEX
            });
        }
    }).catch(function( error ){
        // Error obtaining the number of pages
        console.log('Error obtaining the number of pages');

        /* error obtaining the total of pages */
        deferred.reject({
            code: exports.ERROR_CODE_FETCH_ERROR,
            content: errorHandler.getErrorMessage(error)
        });
    });

    return deferred.promise;
};
