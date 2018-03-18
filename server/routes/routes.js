// Controllers (route handlers).
import homeController from '../controllers/homeController';
import userController from '../controllers/userController';
// import apiController from '../controllers/apiController';
import contactController from '../controllers/contactController';
// import authMiddleware from '../middleware/auth';

// API keys and Passport configuration.
const passportConfig = require('../config/passport');

const routes = (router) => {
//   router.get('/api/v1', (req, res) => {
//     res.json({
//       status: 'Welcome to SPYDER GIS API'
//     });
//   });

  // Primary app routes.
  router.get('/', homeController.index);
  router.get('/logout', userController.logout);
  router.get('/login', userController.getLogin);
  router.get('/forgot', userController.getForgot);
  router.get('/signup', userController.getSignup);
  router.get('/contact', contactController.getContact);
  router.get('/reset/:token', userController.getReset);
  router.get('/account', passportConfig.isAuthenticated, userController.getAccount);
  router.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);

  router.post('/login', userController.postLogin);
  router.post('/forgot', userController.postForgot);
  router.post('/reset/:token', userController.postReset);
  router.post('/signup', userController.postSignup);
  router.post('/contact', contactController.postContact);
  router.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
  router.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
  router.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);

  // router.get('*', (req, res) =>
  //   res.status(404).send({
  //     message: 'That route does not exist'
  //   })
  // );

  //   router.route('/users/signup')
//     /** POST api/v1/users/signup - Create a new user */
//     .post(userController.create);

//   router.route('/users/signin')
//     /** POST api/v1/users/signin - Log in a user */
//     .post(userController.login);

//   router.route('/users/:userId')
//     /** GET api/v1/:userId/ - Get a user */
//     .get(authMiddleware.verifyToken,
//       authMiddleware.verifyUser,
//       userController.retrieve);

//   router.route('/users/:userId/recipes')
//     /** POST api/v1/:userId/recipes - Make a recipes favourite */
//     .post(authMiddleware.verifyToken, authMiddleware.verifyUser,
//       favoriteController.create)
//     /** GET api/v1/:userId/recipes - Get user favourite recipes */
//     .get(authMiddleware.verifyToken, authMiddleware.verifyUser,
//       favoriteController.list);

//   router.route('/users/:userId/my-recipes')
//     /** GET api/v1/:userId/recipes - Get recipes created by a user */
//     .get(authMiddleware.verifyToken, authMiddleware.verifyUser,
//       recipeController.getUserRecipe);

//   router.route('/recipes')
//     /**
//      * GET api/v1/recipes - Get list of all recipes
//      */
//     .get(recipeController.list)
//     /**
//      * POST api/v1/recipes - Create a new recipe
//      */
//     .post(authMiddleware.verifyToken, recipeController.create);

//   router.route('/recipes/:recipeId')
//     /**
//      * PUT api/v1/recipes/:recipeId - Update an existing recipe
//      */
//     .put(authMiddleware.verifyToken, recipeController.update)
//     /**
//        * GET api/v1/recipes/:recipeId - Get a recipe
//        */
//     .get(authMiddleware.verifyToken, recipeController.retrieve)
//   /**
//        * DELETE api/v1/recipes/:recipeID - Delete a recipe
//        */
//     .delete(authMiddleware.verifyToken, recipeController.destroy);

//   router.route('/recipes/:recipeId/reviews')
//     /**
//      * POST api/v1/:recipeId/reviews - Create a review for a recipe
//      */
//     .post(authMiddleware.verifyToken, reviewController.create)
//     /**
//       * GET api/v1/:recipeId/reviews - Get all recipe reviews
//      */
//     .get(authMiddleware.verifyToken, reviewController.list);
//   /**
//     * POST api/vi/votes/:userId/upVotes
//     */
//   router.route('/votes/:userId/upVotes')
//     .post(authMiddleware.verifyToken, authMiddleware.verifyUser,
//       votingController.upVote);
//   /**
//    * POST api/vi/votes/:userId/downvote
//    */
//   router.route('/votes/:userId/downVotes')
//     .post(authMiddleware.verifyToken, authMiddleware.verifyUser,
//       votingController.downVote);
};

export default routes;
