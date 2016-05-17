'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', [ 'ui.router', 'syn-auth',
		'angularFileUpload' ]);

app
		.config(
				[
						'$stateProvider',
						'$urlRouterProvider',
						function($stateProvider, $routeProvider) {
							$stateProvider
									.state(
											'login',
											{
												url : '/login',
												requireLogin : false,
												views : {
													"root" : {
														templateUrl : 'views/login.html',
														controller : 'LoginCtrl'
													}
												}
											})
									.state(
											'logout',
											{
												url : '/logout',
												requireLogin : false,
												views : {
													"root" : {
														template : '<div>logout</div>',
														controller : function(
																$scope,
																$window,
																synConn) {
															synConn.logout();
															window.location.hash = '#/login';
														}
													}
												}
											})
									.state(
											'layout',
											{
												url : '/layout',
												requireLogin : true,
												views : {
													"root" : {
														templateUrl : 'views/layout.html',
													}
												}
											})
									.state(
											'fullscreen',
											{
												url : '/full',
												requireLogin : true,
												views : {
													"root" : {
														templateUrl : 'views/fullscreen.html?dez',
													}
												}
											})
									.state(
											'layout.home',
											{
												requireLogin : true,
												url : '/',
												views : {
													"sidebar" : {
														templateUrl : 'views/sidebar.html'
													}
												}
											})
									.state(
											'layout.view',
											{
												url : '/view/:id?:idCat',
												requireLogin : true,
												views : {
													"sidebar" : {
														templateUrl : 'views/sidebar.html',
														controller : 'SidebarCtrl'
													},
													"main" : {
														templateUrl : 'views/recette.html?de',
														controller : 'RecetteCtrl'
													}

												}
											})
									.state(
											'layout.newRecette',
											{
												url : '/newRecette',
												requireLogin : true,
												views : {
													"sidebar" : {
														templateUrl : 'views/sidebar.html'
													},
													"main" : {
														templateUrl : 'views/newRecette.html',
														controller : 'NewRecetteCtrl'
													}

												}
											})
									.state(
											'layout.categoriesDetails',
											{
												url : '/categoriesDetails?:idCat',
												requireLogin : true,
												views : {
													"sidebar" : {
														templateUrl : 'views/sidebar.html?de'
													}
												/*
												 * , "main": { templateUrl:
												 * '/partial/categoriesDetails.html',
												 * controller: 'CategoriesCtrl' }
												 */
												}
											})
									.state(
											'fullscreen.view',
											{
												url : '/fullscreen/:id?:idCat',
												requireLogin : true,
												views : {
													"fullscreen" : {
														templateUrl : 'views/fullRecette.html',
														controller : 'RecetteCtrl'
													}
												}
											});

							$routeProvider.otherwise('/login');
						} ])
		.controller('SidebarCtrl', function($scope, $stateParams, synConn) {
			$scope.recettes = [];
			var idCat = -1;
			var o = {};
			var u = '';
			idCat = $stateParams.idCat;
			if (idCat === undefined) {
				o = {};
				u = 'root/allCategories/';
			} else {
				o = {
					'idCat' : idCat
				};
				u = 'root/allCategories/?idCat=' + idCat;
			}
			synConn.http({
				uri : u,
				data : o
			}).success(function(categories) {
				$scope.categories = categories;
			}).error(function(err) {
				console.info('erreur:' + err);
			});

			$scope.changeCat = function(recetteID, catID) {
				console.info("change:" + recetteID + " cat:" + catID);
				synConn.http({
					uri : 'root/recette/' + recetteID,
					method : 'PUT',
					data : {
						"Categorie" : catID
					}
				}).success(function(dataRec) {
					console.info("cat changed");
					$state.go('layout.home', {}, {
						reload : true
					});
				});
			};
		})
		.controller(
				'RecetteCtrl',
				function($scope, $stateParams, $state, synConn, SynAuth, emAuth) {
					console.info(synConn);
					var idRecette = $stateParams.id;
					synConn.http({
						uri : 'root/Recette/' + idRecette
					}).success(
							function(data) {
								$scope.recette = data;
								synConn.getUrlSign('root/Recette/' + idRecette
										+ '/image', function(err, url) {
									$scope.urlRecette = url;									
									synConn.http({
										method: 'GET',
										uri : 'root/allCategories/'
									}).success(function(dataCat) {
										console.info('successCb');
										$scope.dataCategories = {
											list: dataCat
										}
										
									});																							
								});
							}).error(function(err) {
						console.info('erreur:' + err);
					});
					
					$scope.update = function(recette) {
						
						synConn.http({
							method: 'PUT',
							uri:'root/recette/'+recette.ID,
							data: recette
						}).success(function(result) {
							$state.go('layout.view', {}, {
								reload : true
							});
						}).error(function(err) {
							console.info('Erreur lors de la mise à jour de la recette '+recette.Nom);
						});						
					}
					
					$scope.deleteRecette = function(idRecette) {
						synConn.http({
							method: 'DELETE',
							uri: 'root/recette/'+idRecette
						}).success(function(result){
							$state.go('layout.home');
						}).error(function(result) {
							console.info('Erreur lors de la suprression de la recette '+idRecette);
						});
					}
					
				})
		.controller('CategoriesCtrl',
				function($scope, $stateParams, synConn, SynAuth, emAuth) {
					console.info(synConn);
					$scope.data = {
						repeatSelect : null,
						listCategories : [ {
							id : '1',
							name : 'Option A'
						}, {
							id : '2',
							name : 'Option B'
						}, {
							id : '3',
							name : 'Option C'
						} ],
					};

					/*
					 * var idCategories = $stateParams.id; synConn.http({ uri:
					 * 'root/CategoriesList/' + idCategories
					 * }).success(function(data) { $scope.categories = data;
					 * }).error(function(err) { console.info('erreur:' + err);
					 * });
					 */
				})
		.controller(
				'NewRecetteCtrl',
				function($scope, $stateParams, $state, FileUploader, synConn,
						listCategories) {
					var uploader = $scope.uploader = new FileUploader({
						url : '/root/recette/newRecette'
					});

					synConn.http({
						method: 'GET',
						uri : 'root/allCategories/'
					}).success(function(data) {
						console.info('successCb');
						$scope.dataCategories = {
							repeatSelect: null,
							list: data
						}
					})
					

					// FILTERS
					uploader.filters
							.push({
								name : 'imageFilter',
								fn : function(
										item /* {File|FileLikeObject} */,
										options) {
									var type = '|'
											+ item.type.slice(item.type
													.lastIndexOf('/') + 1)
											+ '|';
									return '|jpg|png|jpeg|bmp|gif|'
											.indexOf(type) !== -1;
								}
							});

					// CALLBACKS

					uploader.onWhenAddingFileFailed = function(
							item /* {File|FileLikeObject} */, filter, options) {
						console.info('onWhenAddingFileFailed', item, filter,
								options);
					};
					uploader.onAfterAddingFile = function(fileItem) {
						console.info('onAfterAddingFile', fileItem);
					};
					uploader.onAfterAddingAll = function(addedFileItems) {
						console.info('onAfterAddingAll', addedFileItems);
					};
					uploader.onBeforeUploadItem = function(item) {
					};
					uploader.onProgressItem = function(fileItem, progress) {
						console.info('onProgressItem', fileItem, progress);
					};
					uploader.onProgressAll = function(progress) {
						console.info('onProgressAll', progress);
					};
					uploader.onSuccessItem = function(fileItem, response,
							status, headers) {
						console.info('onSuccessItem', fileItem, response,
								status, headers);
					};
					uploader.onErrorItem = function(fileItem, response, status,
							headers) {
						console.info('onErrorItem', fileItem, response, status,
								headers);
					};
					uploader.onCancelItem = function(fileItem, response,
							status, headers) {
						console.info('onCancelItem', fileItem, response,
								status, headers);
					};
					uploader.onCompleteItem = function(fileItem, response,
							status, headers) {
						console.info('onCompleteItem', fileItem, response,
								status, headers);
					};
					uploader.onCompleteAll = function() {
						console.info('onCompleteAll');
						$state.go('layout.home', {}, {
							reload : true
						});
					};

					$scope.upload = function(it) {
						synConn.getUrlSign('root/Recette/newRecette/',
								function(err, url) {
									it.url = url;
									it.formData.push({
										"catID" : $scope.dataCategories.categorieSelect
									});
									it.upload();
								});
					};

				})
		.controller(
				'LoginCtrl',
				function($window, $scope, $http, $state, emAuth, synConn) {
					var u = (window.location + '')
							.match(/http(s|)\:\/\/([^\/]+)(?:\:(\d+)|)/);

					var port = u[3] || null, secure = (u[1] === 's');

					if (!port) {
						port = secure ? '443' : '80';
					} else if (port === '443') {
						secure = true;
					}

					$scope.conn = {
						host : u[2] + ':' + port,
						email : '',
						password : '',
						secure : secure
					};

					$scope.remember = false;

					$scope.setUserName = function(userName) {
						emAuth.set('userName', userName);
						$scope.fullUserName = userName;
					};

					$scope.signIn = function() {
						console.info("signIn");
						var hostData = {
							host : $scope.conn.host,
							email : $scope.conn.email.trim(),
							password : $scope.conn.password.trim()
						};

						var arr = $scope.conn.host.split(':'), host = u[1], port = arr[1]
								|| '50888';

						emAuth.set('host', hostData.host).set('port', port)
								.set('email', $scope.conn.email).set(
										'password', $scope.conn.password).set(
										'secure', $scope.conn.secure);

						synConn.setOpts({
							host : $scope.conn.host,
							port : '80',
							email : $scope.conn.email,
							password : $scope.conn.password,
							secure : $scope.conn.secure
						});

						synConn.touch('/root', function(err, sa) {
							if (err) {
								synConn.logout();
								$scope.error = err;
							} else {
								emAuth.setAuthenticated(true);

								$scope.setUserName(sa.User);
								$state.go('layout.home');

							}
						});
					};
				});

app.factory('listCategories', function(synConn) {
	return {
		"name" : "Anonymous",
		"Id" : null,
		"data" : function() {
			
			  //return [ { "ID" : 0, "name" : "plats2" }, { "ID" : 1, "name" :
			  //"desserts" } ];
			 
			/*
			 * $http.get('/app/root/localhost').then( function(result) { return
			 * result });
			 */

			
			return synConn.http({
				method: 'GET',
				uri : 'root/allCategories/'
			}).success(function(data) {
				console.info('successCb');
				$scope.dataCategories = data;
				return data;
			})
		},
		"login" : function() {
			console.info("listCat")
		}
	}
});

app
		.factory(
				'emAuth',
				function() {
					var auth = {}, authenticated = true, rememberMe = true, ls = window.localStorage;

					function getItem(key) {
						var v = ls.getItem(key);

						if (v && v.indexOf('__JSON__') === 0) {
							v = v.substr(8);
							return (v === 'undefined') ? undefined : JSON
									.parse(v);
						}
						return v;
					}

					if (rememberMe) {
						auth = {
							'host' : getItem('host'),
							'port' : getItem('port'),
							'email' : getItem('email'),
							'password' : getItem('password'),
							'workplace' : getItem('workplace'),
							'userName' : getItem('userName'),
							'secure' : getItem('secure')
						};
					}

					return {
						setAuthenticated : function(a) {
							authenticated = a;
						},
						isAuthenticated : function() {
							return authenticated;
						},
						set : function(key, value) {
							auth[key] = value;
							if (rememberMe) {
								if (typeof value !== 'string') {
									value = '__JSON__' + JSON.stringify(value);
								}
								ls.setItem(key, value);
							}
							return this;
						},
						get : function(key) {
							return auth[key];
						}
					};
				});

app.run(function($rootScope, $location, emAuth) {
	$rootScope.$on("$stateChangeStart", function(event, toState, toParams,
			fromState, fromParams) {

		if (toState.requireLogin && !emAuth.isAuthenticated()) {
			$location.path('/login');
		} else {
			console.info('test');
		}

	});
});
