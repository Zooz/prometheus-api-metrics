"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prom_client_1 = __importDefault(require("prom-client"));
const utils_1 = require("../utils");
const NUMBER_OF_CONNECTIONS_METRICS_NAME = 'expressjs_number_of_open_connections';
class Express {
    constructor(setupOptions = {}) {
        this.defaultOptions = {};
        this.setupOptions = Object.assign(Object.assign({}, this.defaultOptions), setupOptions);
    }
    collectDefaultServerMetrics(timeout) {
        this.setupOptions.numberOfConnectionsGauge = prom_client_1.default.register.getSingleMetric(NUMBER_OF_CONNECTIONS_METRICS_NAME) || new prom_client_1.default.Gauge({
            name: NUMBER_OF_CONNECTIONS_METRICS_NAME,
            help: 'Number of open connections to the Express.js server'
        });
        if (this.setupOptions.server) {
            setInterval(this.getConnections.bind(this), timeout).unref();
        }
    }
    getConnections() {
        if (this.setupOptions && this.setupOptions.server) {
            this.setupOptions.server.getConnections((error, count) => {
                if (error) {
                    utils_1.debug('Error while collection number of open connections', error);
                }
                else {
                    this.setupOptions.numberOfConnectionsGauge.set(count);
                }
            });
        }
    }
    handleResponse(req, res) {
        const responseLength = parseInt(res.get('Content-Length')) || 0;
        const route = this.getRoute(req);
        if (route && utils_1.shouldLogMetrics(this.setupOptions.excludeRoutes, route)) {
            this.setupOptions.requestSizeHistogram.observe({
                method: req.method,
                route: route,
                code: res.statusCode
            }, req.metrics.contentLength);
            req.metrics.timer({ route: route, code: res.statusCode });
            this.setupOptions.responseSizeHistogram.observe({
                method: req.method,
                route: route,
                code: res.statusCode
            }, responseLength);
            utils_1.debug(`metrics updated, request length: ${req.metrics.contentLength}, response length: ${responseLength}`);
        }
    }
    getRoute(req) {
        const INVALID_ROUTE = 'N/A';
        let route = req.baseUrl;
        if (req.route) {
            if (req.route.path !== '/') {
                route = route ? route + req.route.path : req.route.path;
            }
            if (!route || route === '') {
                if (!req.originalUrl) {
                    return INVALID_ROUTE;
                }
                route = req.originalUrl.split('?')[0];
            }
            else if (route.indexOf('*') > 0) {
                // wildcard urls, expected for static content, reported groupped
                return route;
            }
            else if (this.setupOptions.groupParametrizedQuery && route.indexOf(':') > 0) {
                // parametrized urls, expected for dynamic content based on param value, reported separately
                route = req.originalUrl.split('?')[0];
            }
            else {
                const splittedRoute = route.split('/');
                const splittedUrl = req.originalUrl.split('?')[0].split('/');
                const routeIndex = splittedUrl.length - splittedRoute.length + 1;
                const baseUrl = splittedUrl.slice(0, routeIndex).join('/');
                route = baseUrl + route;
                console.log('c', route, splittedRoute, splittedUrl, routeIndex, baseUrl);
            }
            if (this.setupOptions.includeQueryParams === true && Object.keys(req.query).length > 0) {
                route = `${route}?${Object.keys(req.query).sort().map((queryParam) => `${queryParam}=<?>`).join('&')}`;
            }
        }
        // nest.js - build request url pattern if exists
        if (typeof req.params === 'object') {
            Object.keys(req.params).forEach((paramName) => {
                route = route.replace(req.params[paramName], ':' + paramName);
            });
        }
        // this condition will evaluate to true only in
        // express framework and no route was found for the request. if we log this metrics
        // we'll risk in a memory leak since the route is not a pattern but a hardcoded string.
        if (!route || route === '') {
            // if (!req.route && res && res.statusCode === 404) {
            return INVALID_ROUTE;
        }
        return route;
    }
    middleware(req, res, next) {
        if (!this.setupOptions.server && req.socket) {
            this.setupOptions.server = req.socket.server;
            this.collectDefaultServerMetrics(this.setupOptions.defaultMetricsInterval);
        }
        if (req.url === this.setupOptions.path) {
            utils_1.debug('Request to /metrics endpoint');
            res.set('Content-Type', prom_client_1.default.register.contentType);
            return res.end(prom_client_1.default.register.metrics());
        }
        if (req.url === `${this.setupOptions.path}.json`) {
            utils_1.debug('Request to /metrics endpoint');
            return res.json(prom_client_1.default.register.getMetricsAsJSON());
        }
        req.metrics = {
            timer: this.setupOptions.responseTimeHistogram.startTimer({
                method: req.method
            }),
            contentLength: parseInt(req.get('content-length')) || 0
        };
        utils_1.debug(`Set start time and content length for request. url: ${req.url}, method: ${req.method}`);
        res.once('finish', () => {
            utils_1.debug('on finish.');
            this.handleResponse(req, res);
        });
        return next();
    }
}
exports.default = Express;
//# sourceMappingURL=express.js.map