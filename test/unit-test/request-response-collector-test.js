'use strict';

const Prometheus = require('prom-client');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const request = require('request');
const requestPromise = require('request-promise-native');
const nock = require('nock');
const Collector = require('../../src/request-response-collector')('prometheus_api_metrics');
const axios = require('axios');
const axiosTime = require('axios-time');
const expect = chai.expect;
const axiosNoTiming = axios.create();
chai.use(chaiAsPromised);
axiosTime(axios);

describe('request.js response time collector', () => {
    describe('while using request', () => {
        describe('initialized with defaults', () => {
            before(() => {
                Collector.init();
            });
            afterEach(() => {
                Prometheus.register.resetMetrics();
            });
            after(() => {
                Prometheus.register.clear();
            });
            it('should collect metrics with path and method for valid request', (done) => {
                nock('http://www.google.com').get('/').reply(200);
                request({ url: 'http://www.google.com', time: true }, async (err, response) => {
                    if (err) {
                        return done(err);
                    }
                    Collector.collect(response);
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="GET",route="/",status_code="200",type="total"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="GET",route="/",status_code="200",type="socket"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="GET",route="/",status_code="200",type="lookup"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="GET",route="/",status_code="200",type="connect"} 1');
                    done();
                });
            });
            it('should collect metrics with path and method for valid request (500)', (done) => {
                nock('http://www.mocky.io').get('/v2/5bd57525310000680041daf2').reply(500);
                request({ url: 'http://www.mocky.io/v2/5bd57525310000680041daf2', time: true }, async (err, response) => {
                    if (err) {
                        return done(err);
                    }
                    Collector.collect(response);
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="GET",route="/v2/5bd57525310000680041daf2",status_code="500",type="total"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="GET",route="/v2/5bd57525310000680041daf2",status_code="500",type="socket"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="GET",route="/v2/5bd57525310000680041daf2",status_code="500",type="lookup"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="GET",route="/v2/5bd57525310000680041daf2",status_code="500",type="connect"} 1');
                    done();
                });
            });
            it('should collect metrics with path and method for valid request (POST)', (done) => {
                nock('http://www.mocky.io').post('/v2/5bd9984b2f00006d0006d1fd').reply(201);
                request({ method: 'POST', url: 'http://www.mocky.io/v2/5bd9984b2f00006d0006d1fd', time: true }, async (err, response) => {
                    if (err) {
                        return done(err);
                    }
                    Collector.collect(response);
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="/v2/5bd9984b2f00006d0006d1fd",status_code="201",type="total"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="/v2/5bd9984b2f00006d0006d1fd",status_code="201",type="socket"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="/v2/5bd9984b2f00006d0006d1fd",status_code="201",type="lookup"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="/v2/5bd9984b2f00006d0006d1fd",status_code="201",type="connect"} 1');
                    done();
                });
            });
            it('should collect metrics with path and method for valid request override route field on the request', (done) => {
                nock('http://www.mocky.io').post('/v2/5bd9984b2f00006d0006d1fd').reply(201);
                request({ method: 'POST', url: 'http://www.mocky.io/v2/5bd9984b2f00006d0006d1fd', metrics: { route: '/v2/:id' }, time: true }, async (err, response) => {
                    if (err) {
                        return done(err);
                    }
                    Collector.collect(response);
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="/v2/:id",status_code="201",type="total"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="/v2/:id",status_code="201",type="socket"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="/v2/:id",status_code="201",type="lookup"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="/v2/:id",status_code="201",type="connect"} 1');
                    done();
                });
            });
            it('should collect metrics with path and method for valid request override target field on the request', (done) => {
                nock('http://www.mocky.io').post('/v2/5bd9984b2f00006d0006d1fd').reply(201);
                request({ method: 'POST', url: 'http://www.mocky.io/v2/5bd9984b2f00006d0006d1fd', metrics: { target: 'www.google.com' }, time: true }, async (err, response) => {
                    if (err) {
                        return done(err);
                    }
                    Collector.collect(response);
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="POST",route="/v2/5bd9984b2f00006d0006d1fd",status_code="201",type="total"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="POST",route="/v2/5bd9984b2f00006d0006d1fd",status_code="201",type="socket"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="POST",route="/v2/5bd9984b2f00006d0006d1fd",status_code="201",type="lookup"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="POST",route="/v2/5bd9984b2f00006d0006d1fd",status_code="201",type="connect"} 1');
                    done();
                });
            });
            it('should collect metrics with path and method for valid request override target and route field on the request', (done) => {
                nock('http://www.mocky.io').post('/v2/5bd9984b2f00006d0006d1fd').reply(201);
                request({ method: 'POST', url: 'http://www.mocky.io/v2/5bd9984b2f00006d0006d1fd', metrics: { target: 'www.google.com', route: '/v2/:id' }, time: true }, async (err, response) => {
                    if (err) {
                        return done(err);
                    }
                    Collector.collect(response);
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="POST",route="/v2/:id",status_code="201",type="total"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="POST",route="/v2/:id",status_code="201",type="socket"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="POST",route="/v2/:id",status_code="201",type="lookup"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="POST",route="/v2/:id",status_code="201",type="connect"} 1');
                    done();
                });
            });
            it('should not collect metrics when time = true in the request is missing', (done) => {
                nock('http://www.mocky.io').post('/v2/5bd9984b2f00006d0006d1fd').reply(201);
                request({ method: 'POST', url: 'http://www.mocky.io/v2/5bd9984b2f00006d0006d1fd', metrics: { route: 'v2/:id' } }, async (err, response) => {
                    if (err) {
                        return done(err);
                    }
                    Collector.collect(response);
                    expect(await Prometheus.register.metrics()).to.not.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="v2/:id",status_code="201",type="total"} 1');
                    expect(await Prometheus.register.metrics()).to.not.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="v2/:id",status_code="201",type="socket"} 1');
                    expect(await Prometheus.register.metrics()).to.not.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="v2/:id",status_code="201",type="lookup"} 1');
                    expect(await Prometheus.register.metrics()).to.not.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="v2/:id",status_code="201",type="connect"} 1');
                    done();
                });
            });
            it('should count client error in counter', (done) => {
                request({ url: 'http://www.mocky1.io/v2/12345', time: true, metrics: { route: 'route' } }, async (err, response) => {
                    if (err) {
                        Collector.collect(err);
                        expect(await Prometheus.register.metrics()).to.include('southbound_client_errors_count{target="www.mocky1.io",error="ENOTFOUND"} 1');
                        return done();
                    }
                    done(new Error('Expect to get error from the http request'));
                });
            });
        });
        describe('initialized with countClientErrors = true', () => {
            before(() => {
                Collector.init({ countClientErrors: true });
            });
            after(() => {
                Prometheus.register.clear();
            });
            it('should count client error in counter', (done) => {
                request({ url: 'http://www.mocky1.io/v2/12345', time: true, metrics: { route: 'route' } }, async (err, response) => {
                    if (err) {
                        Collector.collect(err);
                        expect(await Prometheus.register.metrics()).to.include('southbound_client_errors_count{target="www.mocky1.io",error="ENOTFOUND"} 1');
                        return done();
                    }
                    done(new Error('Expect to get error from the http request'));
                });
            });
        });
        describe('initialized with countClientErrors = false', () => {
            before(() => {
                Collector.init({ countClientErrors: false });
            });
            after(() => {
                Prometheus.register.clear();
            });
            it('shouldn\'t count client error in counter', (done) => {
                request({ url: 'http://www.mocky1.io/v2/12345', time: true, metrics: { route: 'route' } }, async (err, response) => {
                    if (err) {
                        Collector.collect(err);
                        expect(await Prometheus.register.metrics()).to.not.include('southbound_client_errors_count{target="www.mocky1.io",error="ENOTFOUND"} 1');
                        return done();
                    }
                    done(new Error('Expect to get error from the http request'));
                });
            });
        });
    });
    describe('while using request-promise-native', () => {
        describe('Initialize with defaults', () => {
            before(() => {
                Collector.init();
            });
            afterEach(() => {
                Prometheus.register.resetMetrics();
            });
            after(() => {
                Prometheus.register.clear();
            });
            it('should collect metrics with path and method for valid request', () => {
                nock('http://www.google.com').get('/').reply(200);
                return requestPromise({ url: 'http://www.google.com', time: true, resolveWithFullResponse: true }).then(async (response) => {
                    Collector.collect(response);
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="GET",route="/",status_code="200",type="total"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="GET",route="/",status_code="200",type="socket"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="GET",route="/",status_code="200",type="lookup"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="GET",route="/",status_code="200",type="connect"} 1');
                });
            });
            it('should collect metrics with path and method for valid request (500)', () => {
                nock('http://www.mocky.io').get('/v2/5bd57525310000680041daf2').reply(500);
                return requestPromise({ url: 'http://www.mocky.io/v2/5bd57525310000680041daf2', time: true, resolveWithFullResponse: true }).then((response) => {
                    Promise.reject(new Error('Expect to get 500 from the request'));
                }).catch(async (error) => {
                    Collector.collect(error);
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="GET",route="/v2/5bd57525310000680041daf2",status_code="500",type="total"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="GET",route="/v2/5bd57525310000680041daf2",status_code="500",type="socket"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="GET",route="/v2/5bd57525310000680041daf2",status_code="500",type="lookup"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="GET",route="/v2/5bd57525310000680041daf2",status_code="500",type="connect"} 1');
                });
            });
            it('should collect metrics with path and method for valid request (POST)', () => {
                nock('http://www.mocky.io').post('/v2/5bd9984b2f00006d0006d1fd').reply(201);
                return requestPromise({ method: 'POST', url: 'http://www.mocky.io/v2/5bd9984b2f00006d0006d1fd', time: true, resolveWithFullResponse: true }).then(async (response) => {
                    Collector.collect(response);
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="/v2/5bd9984b2f00006d0006d1fd",status_code="201",type="total"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="/v2/5bd9984b2f00006d0006d1fd",status_code="201",type="socket"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="/v2/5bd9984b2f00006d0006d1fd",status_code="201",type="lookup"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="/v2/5bd9984b2f00006d0006d1fd",status_code="201",type="connect"} 1');
                });
            });
            it('should collect metrics with path and method for valid request override route field on the request', () => {
                nock('http://www.mocky.io').post('/v2/5bd9984b2f00006d0006d1fd').reply(201);
                return requestPromise({ method: 'POST', url: 'http://www.mocky.io/v2/5bd9984b2f00006d0006d1fd', metrics: { route: '/v2/:id' }, time: true, resolveWithFullResponse: true }).then(async (response) => {
                    Collector.collect(response);
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="/v2/:id",status_code="201",type="total"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="/v2/:id",status_code="201",type="socket"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="/v2/:id",status_code="201",type="lookup"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="/v2/:id",status_code="201",type="connect"} 1');
                });
            });
            it('should collect metrics with path and method for valid request override target field on the request', () => {
                nock('http://www.mocky.io').post('/v2/5bd9984b2f00006d0006d1fd').reply(201);
                return requestPromise({ method: 'POST', url: 'http://www.mocky.io/v2/5bd9984b2f00006d0006d1fd', metrics: { target: 'www.google.com' }, time: true, resolveWithFullResponse: true }).then(async (response) => {
                    Collector.collect(response);
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="POST",route="/v2/5bd9984b2f00006d0006d1fd",status_code="201",type="total"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="POST",route="/v2/5bd9984b2f00006d0006d1fd",status_code="201",type="socket"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="POST",route="/v2/5bd9984b2f00006d0006d1fd",status_code="201",type="lookup"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="POST",route="/v2/5bd9984b2f00006d0006d1fd",status_code="201",type="connect"} 1');
                });
            });
            it('should collect metrics with path and method for valid request override target and route field on the request', () => {
                nock('http://www.mocky.io').post('/v2/5bd9984b2f00006d0006d1fd').reply(201);
                return requestPromise({ method: 'POST', url: 'http://www.mocky.io/v2/5bd9984b2f00006d0006d1fd', metrics: { target: 'www.google.com', route: '/v2/:id' }, time: true, resolveWithFullResponse: true }).then(async (response) => {
                    Collector.collect(response);
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="POST",route="/v2/:id",status_code="201",type="total"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="POST",route="/v2/:id",status_code="201",type="socket"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="POST",route="/v2/:id",status_code="201",type="lookup"} 1');
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="POST",route="/v2/:id",status_code="201",type="connect"} 1');
                });
            });
            it('should not collect metrics when time = true in the request is missing', () => {
                nock('http://www.mocky.io').post('/v2/5bd9984b2f00006d0006d1fd').reply(201);
                return requestPromise({ method: 'POST', url: 'http://www.mocky.io/v2/5bd9984b2f00006d0006d1fd', metrics: { route: 'v2/:id' }, resolveWithFullResponse: true }).then(async (response) => {
                    Collector.collect(response);
                    expect(await Prometheus.register.metrics()).to.not.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="v2/:id",status_code="201",type="total"} 1');
                    expect(await Prometheus.register.metrics()).to.not.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="v2/:id",status_code="201",type="socket"} 1');
                    expect(await Prometheus.register.metrics()).to.not.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="v2/:id",status_code="201",type="lookup"} 1');
                    expect(await Prometheus.register.metrics()).to.not.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.mocky.io",method="POST",route="v2/:id",status_code="201",type="connect"} 1');
                });
            });
            it('should count client error in counter by default', () => {
                return requestPromise({ method: 'POST', url: 'http://www.mocky1.io/v2/12345', metrics: { route: 'v2/:id' }, time: true, resolveWithFullResponse: true }).catch(async (error) => {
                    Collector.collect(error);
                    expect(await Prometheus.register.metrics()).to.include('southbound_client_errors_count{target="www.mocky1.io",error="ENOTFOUND"} 1');
                });
            });
        });
        describe('initialized with countClientErrors = true', () => {
            before(() => {
                Collector.init({ countClientErrors: true });
            });
            afterEach(() => {
                Prometheus.register.resetMetrics();
            });
            after(() => {
                Prometheus.register.clear();
            });
            it('should count client error in counter', () => {
                return requestPromise({ method: 'POST', url: 'http://www.mocky1.io/v2/12345', metrics: { route: 'v2/:id' }, time: true, resolveWithFullResponse: true }).catch(async (error) => {
                    Collector.collect(error);
                    expect(await Prometheus.register.metrics()).to.include('southbound_client_errors_count{target="www.mocky1.io",error="ENOTFOUND"} 1');
                });
            });
        });
        describe('initialized with countClientErrors = false', () => {
            before(() => {
                Collector.init({ countClientErrors: false });
            });
            afterEach(() => {
                Prometheus.register.resetMetrics();
            });
            after(() => {
                Prometheus.register.clear();
            });
            it('shouldn\'t count client error in counter', () => {
                return requestPromise({ method: 'POST', url: 'http://www.mocky1.io/v2/12345', metrics: { route: 'v2/:id' }, time: true, resolveWithFullResponse: true }).catch(async (error) => {
                    Collector.collect(error);
                    expect(await Prometheus.register.metrics()).to.not.include('southbound_client_errors_count{target="www.mocky1.io",error="ENOTFOUND"} 1');
                });
            });
        });
    });
    describe('while using axios', () => {
        describe('Initialize with defaults', () => {
            before(() => {
                Collector.init();
            });
            afterEach(() => {
                Prometheus.register.resetMetrics();
            });
            after(() => {
                Prometheus.register.clear();
            });
            it('should collect metrics with path and method for valid request', async () => {
                nock('http://www.google.com').get('/').reply(200);
                const response = await axios({ baseURL: 'http://www.google.com', method: 'get', url: '/' });
                Collector.collect(response);
                expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="http://www.google.com",method="GET",route="/",status_code="200",type="total"} 1');
            });
            it('should collect metrics with path and method for valid request (500)', async () => {
                nock('http://www.mocky.io').get('/v2/5bd57525310000680041daf2').reply(500);
                await axios({ baseURL: 'http://www.mocky.io', method: 'get', url: '/v2/5bd57525310000680041daf2' }).catch(async (err) => {
                    Collector.collect(err);
                    expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="http://www.mocky.io",method="GET",route="/v2/5bd57525310000680041daf2",status_code="500",type="total"} 1');
                });
            });
            it('should collect metrics with path and method for valid request (POST)', async () => {
                nock('http://www.mocky.io').post('/v2/5bd9984b2f00006d0006d1fd').reply(201);
                const response = await axios({ baseURL: 'http://www.mocky.io', method: 'post', url: '/v2/5bd9984b2f00006d0006d1fd' });
                Collector.collect(response);
                expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="http://www.mocky.io",method="POST",route="/v2/5bd9984b2f00006d0006d1fd",status_code="201",type="total"} 1');
            });
            it('should collect metrics with path and method for valid request override route field on the request', async () => {
                nock('http://www.mocky.io').post('/v2/5bd9984b2f00006d0006d1fd').reply(201);
                const response = await axios({ baseURL: 'http://www.mocky.io', method: 'post', url: '/v2/5bd9984b2f00006d0006d1fd', metrics: { route: '/v2/:id' } });
                Collector.collect(response);
                expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="http://www.mocky.io",method="POST",route="/v2/:id",status_code="201",type="total"} 1');
            });
            it('should collect metrics with path and method for valid request override target field on the request', async () => {
                nock('http://www.mocky.io').post('/v2/5bd9984b2f00006d0006d1fd').reply(201);
                const response = await axios({ baseURL: 'http://www.mocky.io', method: 'post', url: '/v2/5bd9984b2f00006d0006d1fd', metrics: { target: 'www.google.com' } });
                Collector.collect(response);
                expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="POST",route="/v2/5bd9984b2f00006d0006d1fd",status_code="201",type="total"} 1');
            });
            it('should collect metrics with path and method for valid request override target and route field on the request', async () => {
                nock('http://www.mocky.io').post('/v2/5bd9984b2f00006d0006d1fd').reply(201);
                const response = await axios({ baseURL: 'http://www.mocky.io', method: 'post', url: '/v2/5bd9984b2f00006d0006d1fd', metrics: { target: 'www.google.com', route: '/v2/:id' } });
                Collector.collect(response);
                expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="POST",route="/v2/:id",status_code="201",type="total"} 1');
            });
            it('should count client error in counter by default', async() => {
                await axios({
                    baseURL: 'http://www.mocky1.io',
                    method: 'post'
                }).catch(async (err) => {
                    Collector.collect(err);
                    expect(await Prometheus.register.metrics()).to.include('southbound_client_errors_count{target="www.mocky1.io",error="ENOTFOUND"} 1');
                });
            });
            it('should not collect metrics when not using axios-time plugin', async() => {
                nock('http://www.google.com').get('/').reply(200);
                const response = await axiosNoTiming({ baseURL: 'http://www.google.com', method: 'get', url: '/' });
                Collector.collect(response);
                expect(await Prometheus.register.metrics()).to.not.include('southbound_request_duration_seconds_bucket{le="+Inf",target="http://www.google.com",method="GET",route="/",status_code="200",type="total"} 1');
            });
        });
        describe('initialized with countClientErrors = true', () => {
            before(() => {
                Collector.init({ countClientErrors: true });
            });
            afterEach(() => {
                Prometheus.register.resetMetrics();
            });
            after(() => {
                Prometheus.register.clear();
            });
            it('should count client error in counter', async () => {
                await axios({
                    baseURL: 'http://www.mocky1.io',
                    method: 'post',
                    metrics: { route: 'v2/:id' }
                }).catch(async (err) => {
                    Collector.collect(err);
                    expect(await Prometheus.register.metrics()).to.include('southbound_client_errors_count{target="www.mocky1.io",error="ENOTFOUND"} 1');
                });
            });
        });
        describe('initialized with countClientErrors = false', () => {
            before(() => {
                Collector.init({ countClientErrors: false });
            });
            afterEach(() => {
                Prometheus.register.resetMetrics();
            });
            after(() => {
                Prometheus.register.clear();
            });
            it('shouldn\'t count client error in counter', async () => {
                await axios({
                    baseURL: 'http://www.mocky1.io',
                    url: '/v2/12345',
                    method: 'post',
                    metrics: { route: 'v2/:id' }
                }).catch(async (err) => {
                    Collector.collect(err);
                    expect(await Prometheus.register.metrics()).to.not.include('southbound_client_errors_count{target="www.mocky1.io",error="ENOTFOUND"} 1');
                });
            });
        });
    });
    describe('initialized with useUniqueHistogramName = true', () => {
        before(() => {
            Collector.init({ useUniqueHistogramName: true });
        });
        afterEach(() => {
            Prometheus.register.resetMetrics();
        });
        after(() => {
            Prometheus.register.clear();
        });
        it('should collect metrics with path and method for valid request with project name', (done) => {
            nock('http://www.google.com').get('/').reply(200);
            request({ url: 'http://www.google.com', time: true }, async (err, response) => {
                if (err) {
                    return done(err);
                }
                Collector.collect(response);
                expect(await Prometheus.register.metrics()).to.include('prometheus_api_metrics_southbound_request_duration_seconds_bucket');
                done();
            });
        });
        it('should count client error in counter with project name', () => {
            return requestPromise({ method: 'POST', url: 'http://www.mocky1.io/v2/12345', metrics: { route: 'v2/:id' }, time: true, resolveWithFullResponse: true }).catch(async (error) => {
                Collector.collect(error);
                expect(await Prometheus.register.metrics()).to.include('prometheus_api_metrics_southbound_client_errors_count{target="www.mocky1.io",error="ENOTFOUND"} 1');
            });
        });
    });
    describe('initialized with prefix name', () => {
        before(() => {
            Collector.init({ prefix: 'prefix' });
        });
        afterEach(() => {
            Prometheus.register.resetMetrics();
        });
        after(() => {
            Prometheus.register.clear();
        });
        it('should collect metrics with path and method for valid request with prefix', (done) => {
            nock('http://www.google.com').get('/').reply(200);
            request({ url: 'http://www.google.com', time: true }, async (err, response) => {
                if (err) {
                    return done(err);
                }
                Collector.collect(response);
                expect(await Prometheus.register.metrics()).to.include('prefix_southbound_request_duration_seconds_bucket');
                done();
            });
        });
        it('should count client error in counter with prefix', () => {
            return requestPromise({ method: 'POST', url: 'http://www.mocky1.io/v2/12345', metrics: { route: 'v2/:id' }, time: true, resolveWithFullResponse: true }).catch(async (error) => {
                Collector.collect(error);
                expect(await Prometheus.register.metrics()).to.include('prefix_southbound_client_errors_count');
            });
        });
    });
    describe('initialized with customized durationBuckets', () => {
        before(() => {
            Collector.init({ durationBuckets: [0.002, 0.01, 0.025, 0.035, 0.055, 0.15, 0.155, 0.35, 0.55] });
        });
        afterEach(() => {
            Prometheus.register.resetMetrics();
        });
        after(() => {
            Prometheus.register.clear();
        });
        it('should collect metrics with path and method for valid request', (done) => {
            nock('http://www.google.com').get('/').reply(200);
            request({ url: 'http://www.google.com', time: true }, async (err, response) => {
                if (err) {
                    return done(err);
                }
                Collector.collect(response);
                expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="0.002"');
                expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="0.01"');
                expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="0.025"');
                expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="0.035"');
                expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="0.055"');
                expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="0.15"');
                expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="0.155"');
                expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="0.35"');
                expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="0.55"');
                done();
            });
        });
    });
    describe('initialized with both useUniqueHistogramName = true and prefix', () => {
        before(() => {
            Collector.init({ useUniqueHistogramName: true, prefix: 'prefix' });
        });
        afterEach(() => {
            Prometheus.register.resetMetrics();
        });
        after(() => {
            Prometheus.register.clear();
        });
        it('shouldn\'t count client error in counter with project name', () => {
            return requestPromise({ method: 'POST', url: 'http://www.mocky1.io/v2/12345', metrics: { route: 'v2/:id' }, time: true, resolveWithFullResponse: true }).catch(async (error) => {
                Collector.collect(error);
                expect(await Prometheus.register.metrics()).to.include('prometheus_api_metrics_southbound_client_errors_count{target="www.mocky1.io",error="ENOTFOUND"} 1');
                expect(await Prometheus.register.metrics()).to.not.include('prefix_southbound_client_errors_count{target="www.mocky1.io",error="ENOTFOUND"} 1');
            });
        });
    });
    describe('use claas format', () => {
        let collectorInstance;
        before(() => {
            collectorInstance = new Collector();
        });
        afterEach(() => {
            Prometheus.register.resetMetrics();
        });
        after(() => {
            Prometheus.register.clear();
        });
        it('should collect metrics with path and method for valid request', (done) => {
            nock('http://www.google.com').get('/').reply(200);
            request({ url: 'http://www.google.com', time: true }, async (err, response) => {
                if (err) {
                    return done(err);
                }
                collectorInstance.collect(response);
                expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="GET",route="/",status_code="200",type="total"} 1');
                expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="GET",route="/",status_code="200",type="socket"} 1');
                expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="GET",route="/",status_code="200",type="lookup"} 1');
                expect(await Prometheus.register.metrics()).to.include('southbound_request_duration_seconds_bucket{le="+Inf",target="www.google.com",method="GET",route="/",status_code="200",type="connect"} 1');
                done();
            });
        });
    });
});
