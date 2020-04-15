$(function () {
    resize();
    if (getDevice() !== 'sp') {
        draw();
    }
    window.addEventListener('trueResize', function () {
        resize();
    });
});

function getDevice() {
    const ua = navigator.userAgent;
    if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0) {
        return 'sp';
    } else if (ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0) {
        return 'tab';
    } else {
        return 'other';
    }
}

function resize() {
    let background = $('#background');
    background.attr({height: window.innerHeight, width: window.innerWidth});
}

function draw() {
    let vertexShader = "attribute vec4 color; varying vec4 vertexColor; void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); vertexColor = color;}";
    let fragmentShader = "varying vec4 vertexColor; void main(){gl_FragColor = vertexColor;}";

    const particlesData = [];
    let canvas = document.querySelector('#background');

    let width = canvas.width;
    let height = canvas.height;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas
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
    camera.position.set(0, 0, Math.log(width * 1.2) + 200);

    const particleCount = 500;
    const particleDistance = 80;
    const distanceThreshold = 18;

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

        particlesData.push([]);
    }

    let particles = new THREE.BufferGeometry();
    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particles.dynamic = true;

    const discImage = new THREE.TextureLoader().load('assets/images/disc.png');
    let pMaterial = new THREE.PointsMaterial({
        size: 3,
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

    const lines = new THREE.BufferGeometry();
    let lPositions = new Float32Array(particleCount * 3 * particleCount * 3);
    let lColors = new Float32Array(particleCount * 3 * particleCount * 3);
    lines.setAttribute('position', new THREE.BufferAttribute(lPositions, 3).setUsage(THREE.DynamicDrawUsage));
    lines.setAttribute('color', new THREE.BufferAttribute(lColors, 3).setUsage(THREE.DynamicDrawUsage));
    lines.computeBoundingSphere();
    lines.setDrawRange(0, 0);

    const lMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        colorWrite: true
    });

    let linesMesh = new THREE.LineSegments(lines, lMaterial);
    scene.add(linesMesh);

    const triangles = new THREE.BufferGeometry();
    let tPositions = new Float32Array(particleCount * 3 * particleCount * 3);
    let tColors = new Float32Array(particleCount * 4 * particleCount * 4);
    triangles.setAttribute('position', new THREE.BufferAttribute(tPositions, 3).setUsage(THREE.DynamicDrawUsage));
    triangles.setAttribute('color', new THREE.BufferAttribute(tColors, 4).setUsage(THREE.DynamicDrawUsage));
    triangles.computeBoundingSphere();
    triangles.setDrawRange(0, 0);

    const tMaterial = new THREE.ShaderMaterial({
        blending: THREE.AdditiveBlending,
        transparent: true,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.DoubleSide,
    });

    /*const tMaterial = new THREE.MeshBasicMaterial({
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        //color: 0xffffff
    });*/

    let trianglesMesh = new THREE.Mesh(triangles, tMaterial);
    scene.add(trianglesMesh);

    animate();
    window.addEventListener('trueResize', onResize);

    function animate() {
        render();
        requestAnimFrame(animate);
    }

    function render() {
        let particlePositions = pointCloud.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; ++i) {
            particlesData[i] = [];
        }

        let distances = [];

        for (let i = 0; i < particleCount; ++i) {
            distances.push([]);

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
                distances[i].push(dist);

                if (dist > distanceThreshold) continue;

                particlesData[i].push(j);
            }
        }

        let lVertexPos = 0;
        let lColorPos = 0;
        let tVertexPos = 0;
        let tColorPos = 0;

        for (let i = 0; i < particleCount; ++i) {
            if (particlesData[i].length === 0) continue;

            // find triangles
            let triangles = [];
            for (let index0 = 0; index0 < particlesData[i].length; ++index0) {
                let abs0 = particlesData[i][index0];
                for (let index1 = 0; index1 < particlesData[abs0].length; ++index1) {
                    let abs1 = particlesData[abs0][index1];
                    if (particlesData[i].indexOf(abs1) <= particlesData[i].indexOf(abs0)) continue;
                    triangles.push([abs0, abs1]);
                }
            }

            for (let j = 0; j < triangles.length; ++j) {
                let first = triangles[j][0];
                let second = triangles[j][1];

                particlesData[i].splice(particlesData[i].indexOf(first), 1);
                particlesData[i].splice(particlesData[i].indexOf(second), 1);
                particlesData[first].splice(particlesData[first].indexOf(second), 1);

                // create triangles
                tPositions[tVertexPos++] = particlePositions[i * 3];
                tPositions[tVertexPos++] = particlePositions[i * 3 + 1];
                tPositions[tVertexPos++] = particlePositions[i * 3 + 2];

                tPositions[tVertexPos++] = particlePositions[first * 3];
                tPositions[tVertexPos++] = particlePositions[first * 3 + 1];
                tPositions[tVertexPos++] = particlePositions[first * 3 + 2];

                tPositions[tVertexPos++] = particlePositions[second * 3];
                tPositions[tVertexPos++] = particlePositions[second * 3 + 1];
                tPositions[tVertexPos++] = particlePositions[second * 3 + 2];

                const dist0 = distances[i][first - i - 1];
                const dist1 = distances[i][second - i - 1];
                const dist2 = distances[first][second - first - 1];
                const currentAlpha = Math.min(-Math.log(dist0 / distanceThreshold), -Math.log(dist1 / distanceThreshold));
                const firstAlpha = Math.min(-Math.log(dist1 / distanceThreshold), -Math.log(dist2 / distanceThreshold));
                const secondAlpha = Math.min(-Math.log(dist2 / distanceThreshold), -Math.log(dist0 / distanceThreshold));

                const midX = (particlePositions[i * 3] + particlePositions[first * 3] + particlePositions[second * 3]) / (3 * particleDistance * 2) + 0.5;
                const midY = (particlePositions[i * 3 + 1] + particlePositions[first * 3 + 1] + particlePositions[second * 3 + 1]) / (3 * particleDistance * 2) + 0.5;
                const midZ = (particlePositions[i * 3 + 2] + particlePositions[first * 3 + 2] + particlePositions[second * 3 + 2]) / (3 * particleDistance * 2) + 0.5;

                tColors[tColorPos++] = midX;
                tColors[tColorPos++] = midY;
                tColors[tColorPos++] = midZ;
                tColors[tColorPos++] = currentAlpha;

                tColors[tColorPos++] = midX;
                tColors[tColorPos++] = midY;
                tColors[tColorPos++] = midZ;
                tColors[tColorPos++] = firstAlpha;

                tColors[tColorPos++] = midX;
                tColors[tColorPos++] = midY;
                tColors[tColorPos++] = midZ;
                tColors[tColorPos++] = secondAlpha;
            }

            for (let j = 0; j < particlesData[i].length; j++) {
                const child = particlesData[i][j];
                const dist = distances[i][child - i - 1];
                const alpha = Math.min(-Math.log(dist / distanceThreshold), 0.4);

                lPositions[lVertexPos++] = particlePositions[i * 3];
                lPositions[lVertexPos++] = particlePositions[i * 3 + 1];
                lPositions[lVertexPos++] = particlePositions[i * 3 + 2];

                lPositions[lVertexPos++] = particlePositions[child * 3];
                lPositions[lVertexPos++] = particlePositions[child * 3 + 1];
                lPositions[lVertexPos++] = particlePositions[child * 3 + 2];

                lColors[lColorPos++] = alpha;
                lColors[lColorPos++] = alpha;
                lColors[lColorPos++] = alpha;

                lColors[lColorPos++] = alpha;
                lColors[lColorPos++] = alpha;
                lColors[lColorPos++] = alpha;
            }
        }

        pointCloud.geometry.attributes.position.needsUpdate = true;
        linesMesh.geometry.setDrawRange(0, lVertexPos / 3);
        linesMesh.geometry.attributes.position.needsUpdate = true;
        linesMesh.geometry.attributes.color.needsUpdate = true;
        trianglesMesh.geometry.setDrawRange(0, tVertexPos / 3);
        trianglesMesh.geometry.attributes.position.needsUpdate = true;
        trianglesMesh.geometry.attributes.color.needsUpdate = true;

        const time = Date.now() * 0.001;

        const scrollHeight = window.pageYOffset;
        pointCloud.rotation.x = -scrollHeight / height * Math.PI;
        pointCloud.rotation.z = time * 0.05;
        linesMesh.rotation.x = -scrollHeight / height * Math.PI;
        linesMesh.rotation.z = time * 0.05;
        trianglesMesh.rotation.x = -scrollHeight / height * Math.PI;
        trianglesMesh.rotation.z = time * 0.05;
        renderer.render(scene, camera);
    }

    function onResize(){
        width = canvas.width;
        height = canvas.height;

        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);

        camera.aspect = width / height;
        camera.position.set(0, 0, Math.log(width * 1.2) + 200);
        camera.updateProjectionMatrix();
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