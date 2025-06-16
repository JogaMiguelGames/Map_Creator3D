
// === Setup básico Three.js ===  
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cubo vermelho principal
const cubeGeometry = new THREE.BoxGeometry(1,1,1);
const cubeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
const mainCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
mainCube.position.set(0, 0, 0);
mainCube.name = 'Cube';
scene.add(mainCube);

// Lista de cubos/esferas criados
const cubes = [mainCube];

// Luz ambiente
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

camera.position.set(0, 1.6, 5);

let yaw = 0, pitch = 0;
const moveSpeed = 5;
const lookSpeed = 0.002;
const keys = {};

// Variáveis para controle do botão direito e Pointer Lock
const canvas = renderer.domElement;
let isRightMouseDown = false;

// Linha verde no eixo Y (vertical - cima e baixo)
const yLine = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -9999, 0),
    new THREE.Vector3(0,  9999, 0),
  ]),
  new THREE.LineBasicMaterial({ color: 0x00ff00 })
);
scene.add(yLine);

// Linha vermelha no eixo X (horizontal - esquerda e direita)
const xLine = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-9999, 0, 0),
    new THREE.Vector3( 9999, 0, 0),
  ]),
  new THREE.LineBasicMaterial({ color: 0xff0000 })
);
scene.add(xLine);

// Linha azul no eixo Z (profundidade - frente e trás)
const zLine = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, -9999),
    new THREE.Vector3(0, 0,  9999),
  ]),
  new THREE.LineBasicMaterial({ color: 0x0000ff })
);
scene.add(zLine);

// Previne menu de contexto do botão direito no canvas
canvas.addEventListener('contextmenu', e => e.preventDefault());

// Quando o botão direito é pressionado, pede Pointer Lock
canvas.addEventListener('mousedown', e => {
  if (e.button === 2) {
    isRightMouseDown = true;
    canvas.requestPointerLock();
  }
});

// Quando botão direito é solto, sai do Pointer Lock
document.addEventListener('mouseup', e => {
  if (e.button === 2) {
    isRightMouseDown = false;
    if (document.pointerLockElement === canvas) {
      document.exitPointerLock();
    }
  }
});

// Quando o Pointer Lock muda, adiciona ou remove o listener de movimento do mouse
document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement === canvas) {
    document.addEventListener('mousemove', onMouseMove, false);
  } else {
    document.removeEventListener('mousemove', onMouseMove, false);
  }
});

// Atualiza yaw e pitch só se botão direito estiver pressionado
function onMouseMove(e) {
  if (isRightMouseDown) {
    yaw -= e.movementX * lookSpeed;
    pitch -= e.movementY * lookSpeed;
    const maxPitch = Math.PI/2 - 0.01;
    pitch = Math.max(-maxPitch, Math.min(maxPitch, pitch));
  }
}

// Controle teclado
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// Atualiza câmera com base no input
function updateCamera(delta) {
  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.normalize();

  const right = new THREE.Vector3();
  right.crossVectors(forward, camera.up).normalize();

  if (keys['KeyW']) camera.position.addScaledVector(forward, moveSpeed * delta);
  if (keys['KeyS']) camera.position.addScaledVector(forward, -moveSpeed * delta);
  if (keys['KeyA']) camera.position.addScaledVector(right, -moveSpeed * delta);
  if (keys['KeyD']) camera.position.addScaledVector(right, moveSpeed * delta);
  if (keys['KeyE']) camera.position.y += moveSpeed * delta;
  if (keys['KeyQ']) camera.position.y -= moveSpeed * delta;
}

// === Manipulação da UI ===
const commandInput = document.getElementById('commandInput');
const scaleXInput = document.getElementById('scaleX');
const scaleYInput = document.getElementById('scaleY');
const scaleZInput = document.getElementById('scaleZ');
const posXInput = document.getElementById('posX');
const posYInput = document.getElementById('posY');
const posZInput = document.getElementById('posZ');
const rotXInput = document.getElementById('rotX');
const rotYInput = document.getElementById('rotY');
const rotZInput = document.getElementById('rotZ');
const colorHexInput = document.getElementById('colorHex');
const cubeListDiv = document.getElementById('cubeList');
const addCubeBtn = document.getElementById('addCubeBtn');

let selectedCube = mainCube;

addCubeBtn.addEventListener('click', () => {
  // Cria cubo verde para diferenciar do vermelho principal
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  
  cube.position.set(0, 0, 0);
  cube.scale.set(1, 1, 1);

  // Conta cubos já criados para nomear
  const cubeCount = cubes.filter(obj => obj.name && obj.name.startsWith('Cube')).length;
  cube.name = cubeCount === 0 ? 'Cube' : `Cube ${cubeCount + 1}`;

  scene.add(cube);
  cubes.push(cube);
  selectedCube = cube;
  updatePanelForCube(selectedCube);
  updateCubeList();
});

// Atualiza os valores do painel para o cubo selecionado
function updatePanelForCube(cube) {
  if (!cube) {
    [scaleXInput, scaleYInput, scaleZInput, posXInput, posYInput, posZInput, colorHexInput].forEach(i => {
      i.value = '';
      i.disabled = true;
    });
    [rotXInput, rotYInput, rotZInput].forEach(i => {
      i.value = '';
      i.disabled = true;
    });
    return;
  }
  scaleXInput.disabled = false;
  scaleYInput.disabled = false;
  scaleZInput.disabled = false;
  posXInput.disabled = false;
  posYInput.disabled = false;
  posZInput.disabled = false;
  rotXInput.disabled = false;
  rotYInput.disabled = false;
  rotZInput.disabled = false;
  colorHexInput.disabled = false;

  rotXInput.value = THREE.MathUtils.radToDeg(cube.rotation.x).toFixed(2);
  rotYInput.value = THREE.MathUtils.radToDeg(cube.rotation.y).toFixed(2);
  rotZInput.value = THREE.MathUtils.radToDeg(cube.rotation.z).toFixed(2);

  scaleXInput.value = cube.scale.x.toFixed(2);
  scaleYInput.value = cube.scale.y.toFixed(2);
  scaleZInput.value = cube.scale.z.toFixed(2);

  posXInput.value = cube.position.x.toFixed(2);
  posYInput.value = cube.position.y.toFixed(2);
  posZInput.value = cube.position.z.toFixed(2);

  // Atualiza o input de cor HEX do material
  if (cube.material && cube.material.color) {
    const color = cube.material.color;
    colorHexInput.value = `#${color.getHexString()}`;
  } else {
    colorHexInput.value = '';
  }
}

// Escuta mudanças nos inputs e altera o cubo selecionado
function attachInputListeners() {
  [scaleXInput, scaleYInput, scaleZInput].forEach((input, i) => {
    input.addEventListener('input', () => {
      if (!selectedCube) return;
      const val = parseFloat(input.value);
      if (val > 0) {
        if (i === 0) selectedCube.scale.x = val;
        if (i === 1) selectedCube.scale.y = val;
        if (i === 2) selectedCube.scale.z = val;
      }
    });
  });

  [posXInput, posYInput, posZInput].forEach((input, i) => {
    input.addEventListener('input', () => {
      if (!selectedCube) return;
      const val = parseFloat(input.value);
      if (!isNaN(val)) {
        if (i === 0) selectedCube.position.x = val;
        if (i === 1) selectedCube.position.y = val;
        if (i === 2) selectedCube.position.z = val;
      }
    });
  });
}
attachInputListeners();

// Listeners para rotação
[rotXInput, rotYInput, rotZInput].forEach((input, i) => {
  input.addEventListener('input', () => {
    if (!selectedCube) return;
    const val = parseFloat(input.value);
    if (!isNaN(val)) {
      const rad = THREE.MathUtils.degToRad(val);
      if (i === 0) selectedCube.rotation.x = rad;
      if (i === 1) selectedCube.rotation.y = rad;
      if (i === 2) selectedCube.rotation.z = rad;
    }
  });
});

// Atualiza a lista de objetos na UI
function updateCubeList() {
  cubeListDiv.innerHTML = '';
  cubes.forEach((cube) => {
    const name = cube.name || 'Unnamed';
    const div = document.createElement('div');
    div.textContent = name;
    div.style.padding = '4px 8px';
    div.style.borderRadius = '3px';
    div.style.cursor = 'pointer';
    if (cube === selectedCube) {
      div.style.backgroundColor = '#3366ff';
      div.style.color = 'white';
    }
    div.addEventListener('click', () => {
      selectedCube = cube;
      updatePanelForCube(selectedCube);
      updateCubeList();
    });
    cubeListDiv.appendChild(div);
  });
}

// Raycaster para selecionar objetos pelo centro da tela
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onClick() {
  if (document.pointerLockElement !== canvas) return;
  mouse.x = 0; mouse.y = 0;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(cubes);

  if (intersects.length > 0) {
    selectedCube = intersects[0].object;
    updatePanelForCube(selectedCube);
    updateCubeList();
  }
}
window.addEventListener('click', onClick);

colorHexInput.addEventListener('input', () => {
  if (!selectedCube || !selectedCube.material) return;
  const val = colorHexInput.value.trim();

  // Valida formato HEX (#xxxxxx)
  if(/^#([0-9a-f]{6})$/i.test(val)) {
    selectedCube.material.color.set(val);
  }
});

// Deletar objeto selecionado
window.addEventListener('keydown', (e) => {
  if (e.key === 'Delete' && selectedCube) {
    const index = cubes.indexOf(selectedCube);
    if (index !== -1) {
      scene.remove(selectedCube);
      cubes.splice(index, 1);
      selectedCube = cubes[index - 1] || cubes[0] || null;
      updatePanelForCube(selectedCube);
      updateCubeList();
    }
  }
});

// Ajusta canvas no resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Loop principal
let lastTime = 0;
function animate(time=0) {
  requestAnimationFrame(animate);
  const delta = (time - lastTime) / 1000;
  lastTime = time;

  updateCamera(delta);
  renderer.render(scene, camera);
}
animate();

// Inicializa UI
updatePanelForCube(selectedCube);
updateCubeList();