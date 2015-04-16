'use strict';

// SCT : hack the phong shader so that textures are added above diffuse colors rather than blended
THREE.ShaderChunk.map_fragment = [
      '#ifdef USE_MAP',
          'vec4 texelColor = texture2D( map, vUv ); ',
          '#ifdef GAMMA_INPUT',
          'texelColor.xyz *= texelColor.xyz;',
          '#endif',
          // HACKED LINES ***
          'gl_FragColor = vec4(mix(diffuse,texelColor.xyz,texelColor.a),gl_FragColor.a);',
          'vec3 surfDiffuse = mix(diffuse,vec3(1,1,1),texelColor.a);',
          // ***
      '#else',
          'vec3 surfDiffuse = diffuse;',
      '#endif'].join('\n');
// now replace references to 'diffuse' with 'surfDiffuse'
THREE.ShaderChunk.lights_phong_fragment =
    // HACKED LINES ***
    THREE.ShaderChunk.lights_phong_fragment.replace(/\bdiffuse\b/gm,'surfDiffuse');
    // ***
THREE.ShaderLib.phong.fragmentShader = [
      'uniform vec3 diffuse;',
      'uniform float opacity;',
      'uniform vec3 ambient;',
      'uniform vec3 emissive;',
      'uniform vec3 specular;',
      'uniform float shininess;',
      THREE.ShaderChunk[ 'color_pars_fragment' ],
      THREE.ShaderChunk[ 'map_pars_fragment' ],
      THREE.ShaderChunk[ 'lightmap_pars_fragment' ],
      THREE.ShaderChunk[ 'envmap_pars_fragment' ],
      THREE.ShaderChunk[ 'fog_pars_fragment' ],
      THREE.ShaderChunk[ 'lights_phong_pars_fragment' ],
      THREE.ShaderChunk[ 'shadowmap_pars_fragment' ],
      THREE.ShaderChunk[ 'bumpmap_pars_fragment' ],
      THREE.ShaderChunk[ 'normalmap_pars_fragment' ],
      THREE.ShaderChunk[ 'specularmap_pars_fragment' ],
      'void main() {',
          'gl_FragColor = vec4( vec3 ( 1.0 ), opacity );',
          THREE.ShaderChunk[ 'map_fragment' ],
          THREE.ShaderChunk[ 'alphatest_fragment' ],
          THREE.ShaderChunk[ 'specularmap_fragment' ],
          THREE.ShaderChunk[ 'lights_phong_fragment' ],
          THREE.ShaderChunk[ 'lightmap_fragment' ],
          THREE.ShaderChunk[ 'color_fragment' ],
          THREE.ShaderChunk[ 'envmap_fragment' ],
          THREE.ShaderChunk[ 'shadowmap_fragment' ],
          THREE.ShaderChunk[ 'linear_to_gamma_fragment' ],
          THREE.ShaderChunk[ 'fog_fragment' ],
      '}'
  ].join('\n');


var Viewer3d = Viewer3d || ( function() {

	return {};
});

/**
 * Pre-defined directions
 */
Viewer3d.Direction = {
	LeftToRight: new THREE.Vector3(-1, 0, 0),
	RightToLeft: new THREE.Vector3(1, 0, 0),
	TopToBottom: new THREE.Vector3(0, -1, 0),
	BottomToTop: new THREE.Vector3(0, 1, 0),
	FrontToBack: new THREE.Vector3(0, 0, -1),
	BackToFront: new THREE.Vector3(0, 0, 1)
};

/**
 * Pre-defined position
 */
Viewer3d.Position = {
	Right: new THREE.Vector3(1, 0, 0),
	Left: new THREE.Vector3(-1, 0, 0),
	Bottom: new THREE.Vector3(0, -1, 0),
	Top: new THREE.Vector3(0, 1, 0),
	Back: new THREE.Vector3(0, 0, -1),
	Front: new THREE.Vector3(0, 0, 1),

	BottomLeft: new THREE.Vector3(-1, -1, 0),
	BottomRight: new THREE.Vector3(1, -1, 0),
	BottomFront: new THREE.Vector3(0, -1, 1),
	BottomBack: new THREE.Vector3(0, -1, -1),

	TopLeft: new THREE.Vector3(-1, 1, 0),
	TopRight: new THREE.Vector3(1, 1, 0),
	TopFront: new THREE.Vector3(0, 1, 1),
	TopBack: new THREE.Vector3(0, 1, -1),

	FrontLeft: new THREE.Vector3(-1, 0, 1),
	FrontRight: new THREE.Vector3(1, 0, 1),
	BackLeft: new THREE.Vector3(-1, 0, -1),
	BackRight: new THREE.Vector3(1, 0, -1),

	TopFrontLeft: new THREE.Vector3(-1, 1, 1),
	TopFrontRight: new THREE.Vector3(1, 1, 1),
	TopBackLeft: new THREE.Vector3(-1, 1, -1),
	TopBackRight: new THREE.Vector3(1, 1, -1),

	BottomFrontLeft: new THREE.Vector3(-1, -1, 1),
	BottomFrontRight: new THREE.Vector3(1, -1, 1),
	BottomBackLeft: new THREE.Vector3(-1, -1, -1),
	BottomBackRight: new THREE.Vector3(1, -1, -1)
};


function CameraSet(name, position, target) {
	this.name = name;
	this.position = position;
	this.target = target;
}

angular.module('viewer3d')
.service('_', function () {
	// assumes underscore has already been loaded on the page
	return window._;
})
.factory('ThreejsViewer', function ($q, $timeout, _) {
	// assumes threejs has already been loaded on the page
	var threejs = window.THREE;

	var imageExportSize = 2000;
	var defaultSize = 100;
	var currentCameraType = 'perspective';

	var supportWebGL = ( function () { try { var canvas = document.createElement( 'canvas' ); return !! window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ); } catch( e ) { return false; } } )();

	var that;

	var ThreejsViewer = function (hostDomElement) {
		that = this;

		function animate(time) {
			that._cancelToken = window.requestAnimationFrame(animate);

			TWEEN.update(time);

			that.renderer.render(that.scene, that.camera);
		}

		// Define property for camera position : used for tweening
		Object.defineProperty(this, 'cameraPosition', {
			writeable: true,
			get: function() {
				return that.camera.position;
			},
			set: function(newPosition) {
				that.camera.position.set(newPosition.x, newPosition.y, newPosition.z);
			}
		});


		// Define property for camera look at : used for tweening - use the control's center
		Object.defineProperty(this, 'cameraLookAt', {
			writeable: true,
			get: function() {
				return that.controls.center;
			},
			set: function(newPosition) {
				//newPosition = new THREE.Vector3(0, 0, 0);
				that.camera.lookAt(newPosition);

				var translateControlsCenter = newPosition.clone();
				translateControlsCenter.sub(that.controls.center) ;
				that.controls.center.add(translateControlsCenter);
			}
		});


		if (supportWebGL) {
			this.host = hostDomElement;
			this.scene = new threejs.Scene();

			// Setup renderer
			this.renderer = supportWebGL ? new threejs.WebGLRenderer({
				antialias: true,
				preserveDrawingBuffer: true // needed to be able to render picture
			}) : new threejs.CanvasRenderer();
			this.renderer.setClearColor(0xffffff, 1);
			this.renderer.setSize(defaultSize, defaultSize);
			this.renderer.sortObjects = false;

			hostDomElement.append(this.renderer.domElement);

			this.cameraFieldOfView = 45.0;
			// Initialise camera
			this.camera = new threejs.PerspectiveCamera(this.cameraFieldOfView, 1, 1, 100000);
			this.camera.position.z = 100;

			// Initialise controls
			this.controls = null;
			if (threejs.EditorControls) {
				this.controls = new threejs.EditorControls(this.camera, this.renderer.domElement);
				this.controls.enabled = true;
			}

			// Very basic object interaction : be careful, also called by a drag/drop
			$(this.host).click(function(event) {
        //that.handleObjectIntersections(event);
			});

      // Very basic object interaction : called by a simple click (not a drag/drop)
      window.isDragging = false;
      window.draggingDetector = function() {
        window.isDragging = true;
        $(window).off('mousemove', window.draggingDetector);
      };

      $(that.host)
        .mousedown(function() {
          $(window).on('mousemove', window.draggingDetector);
        })
        .mouseup(function() {
          var wasDragging = window.isDragging;
          $(window).off('mousemove', window.draggingDetector);
          window.isDragging = false;
          if (!wasDragging) {
            that.handleObjectIntersections(event);
          }
        });

			// Stop mouse wheel from scrolling the page
			$(this.host).mousewheelStopPropagation();

			// Initialise Camera set
			this.cameraSet = [];

			// Initialise referenced objects
			this.referencedObjects = [];

			// Initialise callback for object clikc
			this.onMouseClickOnObjects = null;


			// Start animation
			animate();
		}

		this.hasWebGL = supportWebGL !== false && supportWebGL !== undefined && supportWebGL !== null;
	};

	ThreejsViewer.prototype.toggleCamera = function () {

		this.scene.remove(this.camera);

		if(currentCameraType === 'orthographic') {
			this.camera = new threejs.PerspectiveCamera(45, 1, 1, 100000);
			currentCameraType = 'perspective';
		}
		else {

			var host = this.host;
			var hostWidth = $(host).width();
			var hostHeight = $(host).height();

			this.camera = new threejs.OrthographicCamera(hostWidth/-2, hostWidth/2, hostHeight/2, hostHeight/-2, 1, 5000);
			currentCameraType = 'orthographic';
		}

		this.scene.add(this.camera);

		this.controls = null;
		if (threejs.EditorControls) {
			this.controls = new threejs.EditorControls(this.camera, this.renderer.domElement);
			this.controls.enabled = true;
		}

		this.handleResize();
		this.zoomExtents(null, false);
	};

	ThreejsViewer.prototype.dispose = function() {
		if (this._cancelToken) {
			// remove animation frame handler previously setup
			window.cancelAnimationFrame(this._cancelToken);
		}

		this._cancelToken = undefined;
		this.clearScene();
		this.camera = null;
		this.controls.clear();
		this.controls = null;
		this.referencedObjects = null;
		this.symbolTypes = null;
		this.commercialReferences = null;
		this.onMouseClickOnObjects = undefined;
		$(window).off('resize',this.handleResize);
		this.host[0].removeChild(this.renderer.domElement);
		this.renderer.domElement = null;
		this.renderer.resetGLState();
		this.renderer = null;
	};


	ThreejsViewer.prototype.clearScene = function () {
		if (!this.hasWebGL) {
			return;
		}

		var that = this;

        // Gather all objects in a flat array
        var allObjectsInScene = [];
        var index = 0;
        this.scene.traverse(function(child) {
            if(index++ !== 0) allObjectsInScene.push(child);
        });

        _.each(allObjectsInScene, function( object ) {
            that.scene.remove(object);
	        if(object.geometry) {
		        object.geometry.dispose();
		        object.geometry.faces = null;
		        object.geometry.vertices = null;
		        object.geometry.faceVertexUvs = null;
		        object.geometry.boundingSphere = null;
		        object.geometry.uuid = null;
	        }
	        if(object.material) {
		        if (object.material instanceof THREE.MeshFaceMaterial) {
			        $.each(object.material.materials, function(idx, obj) {
				        obj.dispose();
			        });
		        }
	        }
        });

		this.scene.dispatchEvent({type:'cleared'});
	};


	/**
	 * Set callback for object interaction.
	 */
	ThreejsViewer.prototype.setOnMouseClickOnObjectsCallback = function(callback) {
		this.onMouseClickOnObjects = callback;
	};


	/**
	 * Open and display a collada. Removes all previous models from the scene.
	 */
	ThreejsViewer.prototype.openCollada = function (data, baseUrl) {
		if (!this.hasWebGL) {
			return;
		}

		try {
			var loader = new threejs.ColladaLoader();
			loader.options.convertUpAxis = true;

			var xmlParser = new DOMParser();
			var responseXML = xmlParser.parseFromString(data, 'application/xml');

			// Clear current scene
			this.clearScene(this.scene);

			// Parse collada data and add models to scene
			var collada = loader.parse(responseXML, null, baseUrl + 'textures/');
			var dae = collada.scene;

			dae.updateMatrix();
			this.scene.add(dae);

			// Make all materials unique and double sided
			cloneAllMaterials(this.scene);
			makeMaterialsDoubleSided(this.scene);

			// Remove all lights that have been added by the collada
			removeAllLights(this.scene);

			// Initialise lighting on scene
			var ambient = new threejs.AmbientLight(0x444444);
			this.scene.add(ambient);

			//[FRT] JIRA https://schneider-electric-se.atlassian.net/browse/PACE-789
			// Adding a back light so that we can see the rear parts of the objects
			var directionalLight = new threejs.DirectionalLight(0xffffff,0.9);
			directionalLight.position.set(0.7, 0.7, 0.7);
			this.scene.add(directionalLight);

      var directionalLightBack = new threejs.DirectionalLight(0xffffff, 0.7);
			directionalLightBack.position.set(-0.7, -0.7, -0.7);
			this.scene.add(directionalLightBack);

			// Initialise referenced objects
			this.referencedObjects = this.getAllReferencedObjects();

			// Resize screen
			this.handleResize();

			// Position camera to view full scene
			this.zoomExtents(null, false);

			// Initialise symbol type
			this.symbolTypes = collada.symbolTypes();

			// Initialise commercial references
			this.commercialReferences = collada.commercialReferences();

			this.scene.dispatchEvent({type:'loaded'});

			loader.dispose();
			loader = null;
		}
		catch(err) {
			throw 'Opening of Collada failed : error: ' + err;
		}
	};

	ThreejsViewer.prototype.getDimensions = function(someObject3D) {
		if (!this.hasWebGL) {
			return;
		}

		if (!someObject3D) {
			someObject3D = this.scene;
		}

		var helper = new threejs.BoundingBoxHelper(someObject3D, 0xff0000);
		helper.update();
		return helper.box.max;
	};


	ThreejsViewer.prototype.zoomExtents = function (someObject3D, animate) {
		if (!this.hasWebGL) {
			return;
		}

		if (!someObject3D) {
			someObject3D = this.scene;
		}

		// Get box for full scene
		var helper = new threejs.BoundingBoxHelper(someObject3D, 0xff0000);
		helper.update();

		// Set up camera
		this.setupCameraToViewBox(helper.box, animate);
	};



	/**
	 * Returns a camera position to view a target position from a given distance.
	 * An optional direction can be specified - default is along the z direction
	 */
	ThreejsViewer.prototype.getCameraPositionToViewTargetFromDistance = function(target, distance, direction) {
		if (direction === undefined) {
			direction = Viewer3d.Direction.FrontToBack;
		}

		var offset = direction.clone();
		offset.multiplyScalar(-distance);

		return new THREE.Vector3(target.x + offset.x, target.y + offset.y, target.z + offset.z);
	};


	/**
	 * Returns a camera position to view a target node from a given position. The given position is used to define a direction. The position
	 * is relative to the center of the given node
	 */
	ThreejsViewer.prototype.getCameraPositionToViewTargetFromPosition = function(targetNode, position) {

		if (targetNode === null || position === null) {
			return null;
		}

		var box = getBoxContainingNodes([ targetNode ]);
		var center = box.center();

		// Calculate approximate length to view
		var lengthVector = box.max.clone();
		lengthVector.sub(box.min);
		var length = lengthVector.length();

		// Calculate distance necessary
		var distance = length / 2 / Math.tan(Math.PI * this.camera.fov / 360);

		// Add some margin
		distance = distance * 1.2;

		// Get direction of view
		var offset = position.clone();
		offset.divideScalar(offset.length());
		offset.multiplyScalar(distance);

		return new THREE.Vector3(center.x + offset.x, center.y + offset.y, center.z + offset.z);
	};


	/**
	 * Returns a camera position to view a target from a given distance.
	 * An optional direction can be specified - default is along the z direction
	 */
	ThreejsViewer.prototype.getCameraPositionToViewTargetFromDistance = function(target, distance, direction) {
		if (direction === undefined) {
			direction = Viewer3d.Direction.FrontToBack;
		}

		var offset = direction.clone();

		// Normalise direction
		offset.divideScalar(offset.length());

		// Multiple by negative distance
		offset.multiplyScalar(-distance);

		return new THREE.Vector3(target.x + offset.x, target.y + offset.y, target.z + offset.z);
	};


	/**
	 * Returns a camera position to view a box extents. An optional direction can be specified - default
	 * is along the z direction
	 */
	ThreejsViewer.prototype.getCameraPositionToViewBox = function(box, direction) {
		if (!box) {
			return null;
		}

		var center = box.center();

		var distance = 3000; // set camera position far far away (used for ortho)
		if(currentCameraType === 'perspective') {

			// Calculate distance correctly using perspective projection
			var lengthVector = box.max.clone();
			lengthVector.sub(box.min);
			var length = lengthVector.length();
			distance = length / 2 / Math.tan(Math.PI * this.camera.fov / 360);

			// Add some margin
			distance = distance * 1.2;
		}

		var position = this.getCameraPositionToViewTargetFromDistance(center, distance, direction);
		return position;
	};

	/**
	 * Set up camera for given box. This will move the camera, either immediately or animated.
	 */
	ThreejsViewer.prototype.setupCameraToViewBox = function (box, animate, direction) {
		if (!this.hasWebGL) {
			return;
		}

		if (!box) {
			return;
		}

		var center = box.center();

		// Calculate camera position
		var cameraPosition = this.getCameraPositionToViewBox(box, direction);

		// Set camera position
		this.setCameraPositionAndTarget(cameraPosition, center, animate);
	};


	/**
	 * Sets the camera position and target with optional animation.
	 */
	ThreejsViewer.prototype.setCameraPositionAndTarget = function(position, target, animate) {
		if (position === undefined || target === undefined) {
			return;
		}

		if(currentCameraType === 'perspective') {
			var that = this;
			if (animate) {
				var duration = 1000;
				var positionTween = new TWEEN.Tween(this.cameraPosition).to(position, duration).easing(TWEEN.Easing.Quadratic.InOut).start();
				var lookAtTween = new TWEEN.Tween(this.cameraLookAt).to({ x:target.x , y:target.y, z:target.z}, duration).easing(TWEEN.Easing.Quadratic.InOut)
					.onUpdate( function () {
						// Update the camera at each step
						that.camera.lookAt(that.cameraLookAt);

					}).start();

			} else {
				this.cameraPosition = position;
				this.cameraLookAt = target.clone();
			}

		} else {
			// Ortho projection
			this.cameraPosition = position;
			this.cameraLookAt = target.clone();

            var box = getBoxContainingNodes([this.scene]);
			var max = Math.max(box.max.x, box.max.y);

			this.camera.left = -max*this.camera.aspect;
			this.camera.right = max*this.camera.aspect;
			this.camera.top = max;
			this.camera.bottom = -max;

			this.camera.updateProjectionMatrix();
		}

	};

	ThreejsViewer.prototype.handleResize = function (size) {
		this.hasWebGL = supportWebGL !== false && supportWebGL !== undefined && supportWebGL !== null;

		if (!that.hasWebGL) {
			return;
		}

        var width;
        var height;
        if (size && size.hasOwnProperty('height') && size.hasOwnProperty('width')) {
        	 width = size.width;
             height = size.height;
        } else {
        	width = $(that.host).width();
            height = $(that.host).height();
        }

        that.renderer.setSize(width, height);
        that.camera.aspect = width / height;
        that.camera.updateProjectionMatrix();
	};


    ThreejsViewer.prototype.exportPicture = function (logoUrl, logoWidth, logoHeight, caption) {
      if (!this.hasWebGL) {
          return;
      }

      var that = this;
      var deferred = $q.defer();
      var exportSize;

      var image = new Image();
      var background = 'white';

      var oldWidth = $(this.host).width();
      var oldHeight = $(this.host).height();

      // to compute the width/height while keeping aspect
      var scaleAspect = function (maxW, maxH, curW, curH) {
          var ratio = curH / curW;

          if (ratio <= 1) {
              curH = maxH * ratio;
              curW = maxW;
          } else {
              curW = maxW * ratio;
              curH = maxH;
          }

          return { width: curW, height: curH };
      };

      var resolvePromise = function (url) {
          $timeout(function () {
              that.handleResize({width: oldWidth, height: oldHeight});
              deferred.resolve(url);
          }, 100);
      };

      var onRendererImageLoad = function () {
        // init the canvas
        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        var context = canvas.getContext('2d');
        context.fillStyle = background;
        context.fillRect(0, 0, canvas.width, canvas.height);

        /// actually draw the image on canvas
        var offsetX = (canvas.width - exportSize.width ) / 2;
        var offsetY = (canvas.height - exportSize.height) / 2;
        context.drawImage(image, offsetX, offsetY, exportSize.width, exportSize.height);

        if(caption) {
            context.font = '40px Arial';
            context.fillStyle = 'black';
            context.fillText(caption, 20, exportSize.height - 20);
        }

        if (logoUrl) {
          var logo = new Image();
          logo.onload = function () {
            // draw logo at the bottom right corner
            context.drawImage(logo, image.width - logoWidth, image.height - logoHeight, logoWidth, logoHeight);
            resolvePromise(canvas.toDataURL('image/png'));
          };
          logo.src = logoUrl;
        }
        else {
          resolvePromise(canvas.toDataURL('image/png'));
        }
      };

      // scale the image while preserving the aspect
      exportSize = scaleAspect(imageExportSize, imageExportSize, oldWidth, oldHeight);

      this.handleResize(exportSize);

      $timeout(function () {
        var rendererUrl = that.renderer.domElement.toDataURL('image/png');
        image.onload = onRendererImageLoad;
        image.src = rendererUrl;
      }, 100);

      return deferred.promise;
	};

	ThreejsViewer.prototype.zoom = function(zoomValue) {
		if (!this.hasWebGL) {
			return;
		}

		if(!this.controls){
			return;
		}

		// We zoom along Z axis
		var distance = new threejs.Vector3(0,0,zoomValue);

		this.controls.zoom(distance);
	};

	ThreejsViewer.prototype.orbit = function(orbitValue) {
		if (!this.hasWebGL) {
			return;
		}

		if(!this.controls){
			return;
		}

		var vector = new threejs.Vector3(orbitValue.x, orbitValue.y, orbitValue.z);

		this.controls.rotate(vector);
	};


	/**
	 * Handles click on nodes, using raycasting
	 */
	ThreejsViewer.prototype.handleObjectIntersections = function(event) {

		// Get position between (-1, -1) and (1, 1)
		var mousePosition = new THREE.Vector2((1.0 * event.offsetX / event.currentTarget.offsetWidth) * 2 - 1, -((1.0 * event.offsetY / event.currentTarget.offsetHeight) * 2 - 1));

		// Convert mouse position into a beam
		var vector = new THREE.Vector3(mousePosition.x, mousePosition.y, 1);
		vector.unproject(this.camera);

		// Get raycaster from camera position
		var ray = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());

		// create an array containing all objects in the scene with which the ray intersects
		var intersects = ray.intersectObjects(this.referencedObjects, true);

		// Get all nodes with commercial references
		var nodes = [];
		_.each(intersects, function(intersect) {
			var node = intersect.object.parent;
			if (node.userData && node.userData.SE && node.userData.SE.reference) {
				if (!_.contains(nodes, node)) {
					nodes.push(node);
				}
			}
		});

		// Call user-defined callback
		if (this.onMouseClickOnObjects !== null && this.onMouseClickOnObjects !== undefined) {
			this.onMouseClickOnObjects(nodes);
		}

		// Do the following to highlight nodes
		if (false) {
			// Get all potential mesh nodes to highlight
			var allNodesToHighlight = [];
			_.each(nodes, function(node) {
				allNodesToHighlight = allNodesToHighlight.concat(node.children);
			});


			// Remove all highlighting
			this.removeCommercialReferenceHighlighting();

			if (allNodesToHighlight.length > 0) {
				// Remove all highlighting
				this.scene.traverse(function(child) {
					highlightNodes(child.children, false);
				});

				// Highlight selected nodes
				highlightNodes(allNodesToHighlight, true);
			}
		}
	};


	/**
	 * Set visible all nodes for specific symbols
	 * @param symbolTypesSelected The selected symbol types (door, device, etc)
	 */
	ThreejsViewer.prototype.selectSymbolTypes = function (symbolTypesSelected) {
		this.scene.traverse(function(child) {
			setVisibleIfMatchingTypesOrHasNoType(child, symbolTypesSelected);
		});
	};



	/**
	 * Highlight all nodes for specific commercial reference
	 * @param selectedCommercialReference The selected commercial reference
	 */
	ThreejsViewer.prototype.highlightCommercialReference = function (selectedCommercialReference) {
		this.scene.traverse(function(child) {
			highlightIfMatchingCommercialReferences(child, [ selectedCommercialReference ]);
		});
	};


	/**
	 * Highlight all nodes for array of commercial references
	 * @param selectedCommercialReferences The array of selected commercial references
	 */
	ThreejsViewer.prototype.highlightCommercialReferences = function (selectedCommercialReferences) {
		this.scene.traverse(function(child) {
			highlightIfMatchingCommercialReferences(child, selectedCommercialReferences);
		});
	};


	/**
	 * Remove all highlighting for commercial references.
	 */
	ThreejsViewer.prototype.removeCommercialReferenceHighlighting = function() {
		this.scene.traverse(function(child) {
			highlightIfMatchingCommercialReferences(child, null);
		});
	};


	/**
	 * Returns array of all Object3ds corresponding to given commercial reference
	 * @param selectedCommercialReference The selected commercial reference
	 */
	ThreejsViewer.prototype.getNodesWithCommercialReference = function (selectedCommercialReference) {
		var object3Ds = [];

		this.scene.traverse(function(node) {
			if (node.userData && node.userData.SE && node.userData.SE.reference && node.userData.SE.reference === selectedCommercialReference) {
				object3Ds.push(node);
			}
		});

		return object3Ds;
	};


	/**
	 * Returns array of all Object3ds corresponding to array of commercial references
	 * @param selectedCommercialReferences The array of selected commercial references
	 */
	ThreejsViewer.prototype.getNodesWithCommercialReferences = function (selectedCommercialReferences) {
		var object3Ds = [];

		this.scene.traverse(function(node) {
			if (node.userData && node.userData.SE && node.userData.SE.reference && _.contains(selectedCommercialReferences, node.userData.SE.reference)) {
				object3Ds.push(node);
			}
		});

		return object3Ds;
	};


	/**
	 * Positions the camera to view full scene. The camera by default is in front of the scene.
	 */
	ThreejsViewer.prototype.focusOnAll = function() {
		this.zoomExtents(null, true);
	};


	/**
	 * Positions the camera to view commercial reference
	 * @param selectedCommercialReference The selected commercial reference
	 * @param the direction of the camera
	 */
	ThreejsViewer.prototype.focusOnReference = function(commercialReference, direction) {
		// Get bounding box for commercial reference
		var box = this.getBoxForReference(commercialReference);

		// Modify camera position
		this.setupCameraToViewBox(box, true, direction);
	};


	/**
	 * Positions the camera to view array of commercial references
	 * @param selectedCommercialReferences The array of selected commercial references
	 * @param the direction of the camera
	 */
	ThreejsViewer.prototype.focusOnReferences = function(commercialReferences, direction) {
		// Get bounding box for commercial reference
		var box = this.getBoxForReferences(commercialReferences);

		// Modify camera position
		this.setupCameraToViewBox(box, true, direction);
	};



	/**
	 * Gets the position of the center of a node
	 * @param node The Object3d node of the scene
	 */
	ThreejsViewer.prototype.getNodeCenter = function(node) {
		// Get bounding box of node
		var box = getBoxContainingNodes([node]);

		if (box) {
			return box.center();
		} else {
			return null;
		}
	};


	/**
	 * Gets box for given commercial reference
	 * @param commercialReference A commercial reference
	 */
	ThreejsViewer.prototype.getBoxForReference = function(commercialReference) {
		// Get associated nodes
		var nodes = this.getNodesWithCommercialReference(commercialReference);

		// Get bounding box
		return getBoxContainingNodes(nodes);
	};


	/**
	 * Gets box for given array of commercial references
	 * @param commercialReferences An array of commercial references
	 */
	ThreejsViewer.prototype.getBoxForReferences = function(commercialReferences) {
		// Get associated nodes
		var nodes = this.getNodesWithCommercialReferences(commercialReferences);

		// Get bounding box
		return getBoxContainingNodes(nodes);
	};


	/**
	 * Add a camera set (defining position, target and name of set)
	 * @param cameraSet a new CameraSet object to add to the full list of posible camera sets.
	 */
	ThreejsViewer.prototype.addCameraSet = function(cameraSet) {
		if (CameraSet.prototype.isPrototypeOf(cameraSet)) {
			this.cameraSets.push(cameraSet);

		} else {
			console.log('is not a camera set');
		}
	};


	/**
	 * Remove a camera set from the full list
	 * @param cameraSetName the name associated with a CameraSet object.
	 */
	ThreejsViewer.prototype.removeCameraSet = function(cameraSetName) {
		this.cameraSets = _.without(this.cameraSets, _.findWhere(this.cameraSets, {name: cameraSetName}));
	};


	/**
	 * Remove all camera sets.
	 */
	ThreejsViewer.prototype.removeAllCameraSets = function() {
		this.cameraSets = [];
	};


	/**
	 * Use a camera set with optional animation to new position/target
	 * @param cameraSetName The name/identifier of a CameraSet object
	 * @param animate optional boolean value to indicate whether the camera movement should be animated
	 */
	ThreejsViewer.prototype.switchToCamera = function(cameraSetName, animate) {
		if (_.findWhere(this.cameraSets, {name: cameraSetName})) {
			var that = this;
			_.each(this.cameraSets, function(cameraSet) {
				if (cameraSet.name === cameraSetName) {
					that.setCameraPositionAndTarget(cameraSet.position, cameraSet.target, animate);
				}
			});

		} else {
			console.log('unable to find camera set \'' + cameraSetName + '\'');
		}

	};


	/**
	 * Gets all nodes with commercial references
	 */
	ThreejsViewer.prototype.getAllReferencedObjects = function() {
		var referencedObjects = [];

		this.scene.traverse(function(node) {
			if (node.userData && node.userData.SE && node.userData.SE.reference) {
				referencedObjects.push(node);
			}
		});

		return referencedObjects;
	};


	// PRIVATE FUNCTION //


	/**
	 * Handle visibility of object. Use the Mesh materials rather than the
	 * node so that children of a node remain visible if parent is invisible.
	 */
	function setVisibleIfMatchingTypesOrHasNoType(object, symbolTypes) {
		if (object.userData && object.userData.SE) {
			// Iterate over children to find mesh
			_.each(object.children, function(child) {

				// Handle only mesh children
				if (THREE.Mesh.prototype.isPrototypeOf(child)) {
					// Determine if child material is an array of materials or a single one
					if (child.material && !child.material.visible !== undefined) {
						child.material.visible = _.contains(symbolTypes, object.userData.SE.symbol_type);
					}

					// Iterate over child materials
					if (child.material.materials) {
						_.each(child.material.materials, function (material) {
							material.visible = _.contains(symbolTypes, object.userData.SE.symbol_type);
						});
					}
				}
			});

		}

	}



	/**
	 * Handle highlighting of array of commercial references.
	 * Modify transparency of all objects not being highlighted.
	 *
	 * If commercialReferences is null then assume all elements should be highlighted
	 */
	function highlightIfMatchingCommercialReferences(object, commercialReferences) {
		var isHighlighted = false;
		if (commercialReferences !== null) {
			if (object.userData && object.userData.SE && object.userData.SE.reference && _.contains(commercialReferences, object.userData.SE.reference)) {
				isHighlighted = true;
			}
		} else {
			isHighlighted = true;
		}

		highlightNodes(object.children, isHighlighted);
	}


	function highlightNodes(nodes, isHighlighted) {
		// Iterate over children to find mesh
		_.each(nodes, function(node) {

			// Handle only mesh children
			if (THREE.Mesh.prototype.isPrototypeOf(node)) {
				// Determine if node material is an array of materials or a single one
				if (node.material && node.material.opacity !== undefined) {

					// Determine if true opacity has been set, save it otherwise
					if (node.material.oldOpacity === undefined) {
						node.material.oldOpacity = node.material.opacity;
					}

					node.material.opacity = isHighlighted ? node.material.oldOpacity : 0.05;
					node.material.transparent = node.material.opacity < 1.0 ? true : false;
				}

				// Iterate over node materials
				if (node.material.materials) {
					_.each(node.material.materials, function (material) {

						// Determine if true opacity has been set, save it otherwise
						if (material.oldOpacity === undefined) {
							material.oldOpacity = material.opacity;
						}

						material.opacity = isHighlighted ? material.oldOpacity : 0.05;
						material.transparent = material.opacity < 1.0 ? true : false;
					});
				}
			}

		});

	}

	/**
	 * Clone a material or array of materials
	 */
	function cloneMaterial(object) {
		// See if object has a material
		if (object.material) {
			// determine if material contains child materials
			if (object.material.materials) {
				// Clone array of materials
				var newMaterials = [];
				_.each(object.material.materials, function (material) {
					newMaterials.push(material.clone());
				});
				object.material.materials = newMaterials;

			} else {
				// Clone single material
				object.material = object.material.clone();
			}
		}
	}


	/**
	 * Clone all materials in a scene
	 */
	function cloneAllMaterials(scene) {
		scene.traverse(function(child) {
			cloneMaterial(child);
		});
	}


	/**
	 * Makes all materials double sided (rather than front only by default)
	 */
	function makeMaterialsDoubleSided(scene) {
		scene.traverse( function( node ) {
			if( node.material ) {
				// Modify single materials
				node.material.side = THREE.DoubleSide;

				// Check if material is an array
				if (node.material.materials) {
					_.each(node.material.materials, function(material) {
						material.side = THREE.DoubleSide;
					});
				}
			}

		});
	}


	/**
	 * Removes all lights from a scene (these are added automatically from data in the collada)
	 */
	function removeAllLights(scene) {
		var lights = [];
		scene.traverse(function(node) {
			if (THREE.Light.prototype.isPrototypeOf(node)) {
				lights.push(node);
			}
		});

		_.each(lights, function(light) {
			light.parent.remove(light);
		});
	}


	/**
	 * Returns a box for bounds of array of nodes
	 */
	function getBoxContainingNodes(nodes) {
		if (nodes === null) {
			return null;
		}

		var box = null;
		var min = null;
		var max = null;
		_.each(nodes, function(node) {
			var helper = new threejs.BoundingBoxHelper(node, 0xff0000);
			helper.update();

			if (box === null) {
				// First node : create a new box
				box = helper.box.clone();
				min = box.min;
				max = box.max;

			} else {
				// Modify existing box for additional nodes
				var newMin = helper.box.min;
				var newMax = helper.box.max;

				if (newMin.x < min.x) {
					min.setX(newMin.x);
				}
				if (newMin.y < min.y) {
					min.setY(newMin.y);
				}
				if (newMin.z < min.z) {
					min.setZ(newMin.z);
				}
				if (newMax.x > max.x) {
					max.setX(newMax.x);
				}
				if (newMax.y > max.y) {
					max.setY(newMax.y);
				}
				if (newMax.z > max.z) {
					max.setZ(newMax.z);
				}

			}
		});

		return box;
	}

	return ThreejsViewer;
});
