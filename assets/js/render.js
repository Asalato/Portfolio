$(function () {
    resize();
    if(getDevice() !== 'sp') {
        draw();
    }
    $(window).resize(function () {
        resize();
        if(getDevice() !== 'sp') {
            draw();
        }
    });
});

function getDevice(){
    const ua = navigator.userAgent;
    if(ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0){
        return 'sp';
    }else if(ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0){
        return 'tab';
    }else{
        return 'other';
    }
};

function resize() {
    let background = $('#background');
    background.attr({height: background.parent().height(), width: background.parent().width()});
}

function draw() {
    const particlesData = [];
    let canvas = document.querySelector('#background');

    let width = canvas.width;
    let height = canvas.height;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialiasing: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x50788a);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        45,
        width / height,
        1,
        10000
    );
    camera.position.set(0, 0, +500);

    const particleCount = 1000;
    const particleDistance = 220;

    let particlePositions = new Float32Array(particleCount * 3);
    let directions = new Float32Array(particleCount * 3);
    let speeds = new Float32Array(particleCount);
    particlePositions.needsUpdate = true;

    for (let i = 0; i < particleCount; ++i) {
        const unitZ = 2 * (Math.random() - 0.5);
        const radianT = 360 * Math.random();

        particlePositions[3 * i] = particleDistance * Math.sqrt(1 - unitZ * unitZ) * Math.cos(radianT);
        particlePositions[3 * i + 1] = particleDistance * Math.sqrt(1 - unitZ * unitZ) * Math.sin(radianT);
        particlePositions[3 * i + 2] = particleDistance * unitZ;

        const vec = new THREE.Vector3(2 * (Math.random() - 0.5), 2 * (Math.random() - 0.5), 2 * (Math.random() - 0.5)).normalize();
        directions[3 * i] = vec.x;
        directions[3 * i + 1] = vec.y;
        directions[3 * i + 2] = vec.z;

        speeds[i] = Math.sin(Math.random()) * 0.001;

        particlesData.push(0);
    }

    let particles = new THREE.BufferGeometry();
    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particles.dynamic = true;

    const discImage = new THREE.TextureLoader().load('assets/images/disc.png');
    let pMaterial = new THREE.PointsMaterial({
        size: 8,
        color: 0xffffff,
        map: discImage,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthTest: false,
        sizeAttenuation: true,
        opacity: 0.5
    });

    let pointCloud = new THREE.Points(particles, pMaterial);
    scene.add(pointCloud);

    const geometry = new THREE.BufferGeometry();

    let positions = new Float32Array( particleCount * 3 );
    let colors = new Float32Array( particleCount * 3 );
    geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ).setUsage( THREE.DynamicDrawUsage ) );
    geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ).setUsage( THREE.DynamicDrawUsage ) );

    geometry.computeBoundingSphere();

    geometry.setDrawRange( 0, 0 );

    const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true
    });

    let linesMesh = new THREE.LineSegments(geometry, material);
    scene.add( linesMesh );

    animate();

    function animate() {
        render();
        requestAnimFrame(animate);
    }

    function render() {
        let particlePositions = pointCloud.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; ++i) {
            particlesData[i] = 0;
        }

        let vertexpos = 0;
        let colorpos = 0;
        var numConnected = 0;

        for (let i = 0; i < particleCount; ++i) {
            let position = new THREE.Vector3(
                particlePositions[3 * i],
                particlePositions[3 * i + 1],
                particlePositions[3 * i + 2]);
            let ncp = new THREE.Vector3(
                directions[3 * i],
                directions[3 * i + 1],
                directions[3 * i + 2]);

            let a = speeds[i];
            let ca = Math.cos(a);
            let sa = Math.sin(a);
            let t = 1 - ca;
            let r = [
                [ca + ncp.x * ncp.x * t, ncp.x * ncp.y * t - ncp.z * sa, ncp.x * ncp.z * t + ncp.y * sa],
                [ncp.x * ncp.y * t + ncp.z * sa, ca + ncp.y * ncp.y * t, ncp.y * ncp.z * t - ncp.x * sa],
                [ncp.z * ncp.x * t - ncp.y * sa, ncp.z * ncp.y * t + ncp.x * sa, ca + ncp.z * ncp.z * t]
            ];

            particlePositions[3 * i] = r[0][0] * position.x + r[0][1] * position.y + r[0][2] * position.z;
            particlePositions[3 * i + 1] = r[1][0] * position.x + r[1][1] * position.y + r[1][2] * position.z;
            particlePositions[3 * i + 2] = r[2][0] * position.x + r[2][1] * position.y + r[2][2] * position.z;

            // Check collision
            for (let j = i + 1; j < particleCount; j++) {

                const dx = particlePositions[i * 3] - particlePositions[j * 3];
                const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
                const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist <= 25) {
                    if(particlesData[i] > 2 || particlesData[j] > 2) continue;

                    particlesData[i]++;
                    particlesData[j]++;

                    const alpha = -Math.log(dist / 25) * 4;

                    positions[vertexpos++] = particlePositions[i * 3];
                    positions[vertexpos++] = particlePositions[i * 3 + 1];
                    positions[vertexpos++] = particlePositions[i * 3 + 2];

                    positions[vertexpos++] = particlePositions[j * 3];
                    positions[vertexpos++] = particlePositions[j * 3 + 1];
                    positions[vertexpos++] = particlePositions[j * 3 + 2];

                    colors[colorpos++] = alpha;
                    colors[colorpos++] = alpha;
                    colors[colorpos++] = alpha;

                    colors[colorpos++] = alpha;
                    colors[colorpos++] = alpha;
                    colors[colorpos++] = alpha;

                    numConnected++;

                }
            }
        }
        pointCloud.geometry.attributes.position.needsUpdate = true;
        linesMesh.geometry.setDrawRange( 0, numConnected * 2 );
        linesMesh.geometry.attributes.position.needsUpdate = true;
        linesMesh.geometry.attributes.color.needsUpdate = true;

        const time = Date.now() * 0.001;

        const scrollHeight = window.pageYOffset;
        pointCloud.rotation.x = -scrollHeight / height * Math.PI;
        pointCloud.rotation.z = time * 0.05;
        linesMesh.rotation.x = -scrollHeight / height  * Math.PI;
        linesMesh.rotation.z = time * 0.05;
        renderer.render(scene, camera);
    }
}

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();