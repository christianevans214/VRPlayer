class VRPlayer {
    constructor({parent, video_id, height, width, src_height, src_width}) {
        this.video_elem = document.getElementById(video_id);
        this.parent = parent;
        this.rendering = true;
        this.state = {
            latitude: 0,
            longitude: 0,
            savedX: null,
            savedY: null,
            savedLongitude: null,
            savedLatitude: null,
        }
        this.dimensions = {
            height,
            width,
            src_height,
            src_width,
        }
        this.video_canvas = null;
        this.video_canvas_context = null;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.sphere = null;
        this.video_texture = null;
    }

    initialize_video_canvas() {
        this.video_canvas = document.createElement('canvas');
        this.video_canvas.width = this.dimensions.src_width;
        this.video_canvas.height= this.dimensions.src_height;
        this.video_canvas_context = this.video_canvas.getContext('2d');
        this.video_canvas_context.fillStyle = "#000";
        this.video_canvas_context.fillRect(0, 0, this.dimensions.src_width, this.dimensions.src_height);
        return this;
    }

    initialize_renderer() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.dimensions.width, this.dimensions.height);
        return this;
    }
    initialize_scene() {
        this.scene = new THREE.Scene();
        return this;
    }

    initialize_camera() {
        const ratio = this.dimensions.width / this.dimensions.height;
        this.camera = new THREE.PerspectiveCamera(75, ratio, 1, 1000);
        this.camera.target = new THREE.Vector3(0, 0, 0);
        return this;
    }

    initialize_sphere() {
        this.sphere = new THREE.SphereGeometry(100, 100, 40);
        this.sphere.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));
        return this;
    }

    bind_event_listeners(bind_elem) {
        return this;
    }

    initialize() {
        this.initialize_video_canvas()
            .initialize_renderer()
            .initialize_scene()
            .initialize_camera()
            .initialize_sphere()
            .bind_event_listeners(this.renderer.domElement)

        this.parent.appendChild(this.renderer.domElement);
        const sphere_material = new THREE.MeshBasicMaterial();
        this.video_texture = new THREE.Texture(this.video_canvas);
        sphere_material.map = this.video_texture;
        const sphere_mesh = new THREE.Mesh(this.sphere, sphere_material);
        this.scene.add(sphere_mesh);
        this.render();
        return this;
    }

    // toggle_render(tsoggle) {
    //     if toggle {
    //         this.rendering = true;
    //     }
    // }

    render() {
        requestAnimationFrame(this.render.bind(this));

        if ( this.video_elem.readyState === this.video_elem.HAVE_ENOUGH_DATA ) {
            this.video_canvas_context.drawImage(this.video_elem, 0, 0);
            if (this.video_texture) this.video_texture.needsUpdate = true;
        }
        // limiting latitude from -85 to 85 (cannot point to the sky or under your feet)
        this.state.latitude = Math.max(-85, Math.min(85, this.state.latitude));

        // moving the camera according to current latitude (vertical movement) and longitude (horizontal movement)
        this.camera.target.x = 500 * Math.sin(THREE.Math.degToRad(90 - this.state.latitude)) * Math.cos(THREE.Math.degToRad(this.state.longitude));
        this.camera.target.y = 500 * Math.cos(THREE.Math.degToRad(90 - this.state.latitude));
        this.camera.target.z = 500 * Math.sin(THREE.Math.degToRad(90 - this.state.latitude)) * Math.sin(THREE.Math.degToRad(this.state.longitude));
        this.camera.lookAt(this.camera.target);

        // calling again render function
        this.renderer.render(this.scene, this.camera);
    }
}