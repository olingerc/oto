/*jslint node: true */

const routes = [
  // All other get requests should be handled by AngularJS's client-side routing system
  {
    path: '/*',
    httpMethod: 'GET',
    middleware: [function(req, res) {
      res.render('index');
    }]
  }
];

export default routes;
