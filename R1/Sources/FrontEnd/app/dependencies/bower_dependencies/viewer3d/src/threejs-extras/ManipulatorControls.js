
ManipulatorControls = function ( camera, object, domElement ) {

	domElement = ( domElement !== undefined ) ? domElement : document;

	// API
	this.enabled = true;
	this.center = new THREE.Vector3();

	// internals
	var scope = this;
	var vector = new THREE.Vector3();

	var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 };
	var state = STATE.NONE;

	var center = this.center;
	var normalMatrix = new THREE.Matrix3();
	var pointer = new THREE.Vector2();
	var pointerOld = new THREE.Vector2();

	var theta = 0.0;
	var phi = 0.0;
	
	// events

	var changeEvent = { type: 'change' };

	this.focus = function ( target, frame ) {

		scope.dispatchEvent( changeEvent );

	};

	this.pan = function ( distance ) {

		normalMatrix.getNormalMatrix( camera.matrix );

		distance.applyMatrix3( normalMatrix );
		distance.multiplyScalar( vector.copy( center ).sub( camera.position ).length() * 0.001 );

		camera.position.add( distance );
		center.add( distance );
		

		scope.dispatchEvent( changeEvent );

	};

	this.zoom = function ( distance ) {

		normalMatrix.getNormalMatrix( camera.matrix );

		distance.applyMatrix3( normalMatrix );
		distance.multiplyScalar( vector.copy( center ).sub( camera.position ).length() * 0.001 );

		camera.position.add( distance );

		scope.dispatchEvent( changeEvent );

	};

	this.rotate = function ( delta ) {


		theta += delta.x;
		phi += delta.y;


		var rotationMatrix = scope.getRotationMatrix(phi, theta, 0.0);
		
		object.matrix = new THREE.Matrix4();
		object.applyMatrix(rotationMatrix);
		
		scope.dispatchEvent( changeEvent );

	};

	this.getRotationMatrix = function(rx, ry, rz) {
		var cr = Math.cos(rx);
		var sr = Math.sin(rx);
		var cp = Math.cos(ry);
		var sp = Math.sin(ry);
		var cy = Math.cos(rz);
		var sy = Math.sin(rz);

		var m11 = cp*cy;
		var m12 = cp*sy;
		var m13 = -sp;

		var srsp = sr*sp;
		var crsp = cr*sp;

		var m21 = srsp*cy-cr*sy;
		var m22 = srsp*sy+cr*cy;
		var m23 = sr*cp;

		var m31 = crsp*cy+sr*sy;
		var m32 = crsp*sy-sr*cy;
		var m33 = cr*cp;
	
		return new THREE.Matrix4(m11, m12, m13, 0.0, m21, m22, m23, 0.0, m31, m32, m33, 0.0, 0.0, 0.0, 0.0, 1.0);
	};

	this.resetRotation = function() {
		theta = 0.0;
		phi = 0.0;

		var rotationMatrix = scope.getRotationMatrix(phi, theta, 0.0);
		
		object.matrix = new THREE.Matrix4();
		object.applyMatrix(rotationMatrix);
		
		scope.dispatchEvent( changeEvent );
	};
	
	// mouse

	function onMouseDown( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		if ( event.button === 0 ) {

			state = STATE.ROTATE;

		} else if ( event.button === 1 ) {

			state = STATE.ZOOM;

		} else if ( event.button === 2 ) {

			state = STATE.PAN;

		}

		pointerOld.set( event.clientX, event.clientY );

		domElement.addEventListener( 'mousemove', onMouseMove, false );
		domElement.addEventListener( 'mouseup', onMouseUp, false );
		domElement.addEventListener( 'mouseout', onMouseUp, false );
		domElement.addEventListener( 'dblclick', onMouseUp, false );

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		pointer.set( event.clientX, event.clientY );

		var movementX = pointer.x - pointerOld.x;
		var movementY = pointer.y - pointerOld.y;

		if ( state === STATE.ROTATE ) {

			scope.rotate( new THREE.Vector3( - movementX * 0.005, - movementY * 0.005, 0 ) );

		} else if ( state === STATE.ZOOM ) {

			scope.zoom( new THREE.Vector3( 0, 0, movementY ) );

		} else if ( state === STATE.PAN ) {

			scope.pan( new THREE.Vector3( - movementX, movementY, 0 ) );

		}

		pointerOld.set( event.clientX, event.clientY );

	}

	function onMouseUp( event ) {

		domElement.removeEventListener( 'mousemove', onMouseMove, false );
		domElement.removeEventListener( 'mouseup', onMouseUp, false );
		domElement.removeEventListener( 'mouseout', onMouseUp, false );
		domElement.removeEventListener( 'dblclick', onMouseUp, false );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		// if ( scope.enabled === false ) return;

		var delta = 0;

		if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

			delta = - event.wheelDelta;

		} else if ( event.detail ) { // Firefox

			delta = event.detail * 10;

		}

		scope.zoom( new THREE.Vector3( 0, 0, delta ) );

	}

	domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	domElement.addEventListener( 'mousedown', onMouseDown, false );
	domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox

	// touch

	var touch = new THREE.Vector3();

	var touches = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];
	var prevTouches = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];

	var prevDistance = null;

	function touchStart( event ) {

		if ( scope.enabled === false ) return;

		switch ( event.touches.length ) {

			case 1:
				touches[ 0 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 );
				touches[ 1 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 );
				break;

			case 2:
				touches[ 0 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 );
				touches[ 1 ].set( event.touches[ 1 ].pageX, event.touches[ 1 ].pageY, 0 );
				prevDistance = touches[ 0 ].distanceTo( touches[ 1 ] );
				break;

		}

		prevTouches[ 0 ].copy( touches[ 0 ] );
		prevTouches[ 1 ].copy( touches[ 1 ] );

	}


	function touchMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		var getClosest = function( touch, touches ) {

			var closest = touches[ 0 ];

			for ( var i in touches ) {
				if ( closest.distanceTo(touch) > touches[ i ].distanceTo(touch) ) closest = touches[ i ];
			}

			return closest;

		}

		switch ( event.touches.length ) {

			case 1:
				touches[ 0 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 );
				touches[ 1 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 );
				scope.rotate( touches[ 0 ].sub( getClosest( touches[ 0 ] ,prevTouches ) ).multiplyScalar( - 0.005 ) );
				break;

			case 2:
				touches[ 0 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 );
				touches[ 1 ].set( event.touches[ 1 ].pageX, event.touches[ 1 ].pageY, 0 );
				distance = touches[ 0 ].distanceTo( touches[ 1 ] );
				scope.zoom( new THREE.Vector3( 0, 0, prevDistance - distance ) );
				prevDistance = distance;


				var offset0 = touches[ 0 ].clone().sub( getClosest( touches[ 0 ] ,prevTouches ) );
				var offset1 = touches[ 1 ].clone().sub( getClosest( touches[ 1 ] ,prevTouches ) );
				offset0.x = -offset0.x;
				offset1.x = -offset1.x;

				scope.pan( offset0.add( offset1 ).multiplyScalar( 0.5 ) );

				break;

		}

		prevTouches[ 0 ].copy( touches[ 0 ] );
		prevTouches[ 1 ].copy( touches[ 1 ] );

	}

	
	
	domElement.addEventListener( 'touchstart', touchStart, false );
	domElement.addEventListener( 'touchmove', touchMove, false );

};

ManipulatorControls.prototype = Object.create( THREE.EventDispatcher.prototype );
