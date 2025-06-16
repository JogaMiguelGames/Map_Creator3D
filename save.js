document.getElementById('saveButton').addEventListener('click', () => {
  const mapData = cubes.map(cube => ({
    name: cube.name || 'Cube',
    position: {
      x: cube.position.x,
      y: cube.position.y,
      z: cube.position.z
    },
    scale: {
      x: cube.scale.x,
      y: cube.scale.y,
      z: cube.scale.z
    },
    rotation: {
      x: cube.rotation.x,
      y: cube.rotation.y,
      z: cube.rotation.z
    },
    color: `#${cube.material?.color?.getHexString() || 'ffffff'}`
  }));

  const json = JSON.stringify(mapData, null, 2); // bonito e indentado

  const blob = new Blob([json], { type: 'application/json' });

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'map1.map';
  a.click();
  URL.revokeObjectURL(a.href);
});