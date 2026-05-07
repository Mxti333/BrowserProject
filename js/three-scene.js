function webglSupported() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

function cssVar(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export function initThreeScene(container, fallbackElement) {
  if (!container || window.innerWidth < 768 || !window.THREE || !webglSupported()) {
    fallbackElement?.classList.remove("hidden");
    container?.classList.add("hidden");
    return { destroy: () => {}, updateAccent: () => {} };
  }

  const { THREE } = window;

  fallbackElement?.classList.add("hidden");
  container.classList.remove("hidden");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.z = 4;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  const geometry = new THREE.TorusKnotGeometry(1.05, 0.28, 130, 18);
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(cssVar("--accent", "#6c63ff")),
    wireframe: true,
    transparent: true,
    opacity: 0.7
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  let raf = null;
  let hovered = false;

  function resize() {
    const size = Math.min(container.clientWidth || 300, container.clientHeight || 300);
    renderer.setSize(size, size, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }

  function animate() {
    const speed = hovered ? 0.018 : 0.006;
    mesh.rotation.x += speed * 0.6;
    mesh.rotation.y += speed;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  }

  function onEnter() {
    hovered = true;
    material.color = new THREE.Color(cssVar("--accent-2", "#00f5ff"));
  }

  function onLeave() {
    hovered = false;
    material.color = new THREE.Color(cssVar("--accent", "#6c63ff"));
  }

  function updateAccent() {
    material.color = new THREE.Color(hovered ? cssVar("--accent-2", "#00f5ff") : cssVar("--accent", "#6c63ff"));
  }

  container.addEventListener("mouseenter", onEnter);
  container.addEventListener("mouseleave", onLeave);
  window.addEventListener("resize", resize);

  resize();
  animate();

  return {
    destroy() {
      cancelAnimationFrame(raf);
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
    updateAccent
  };
}
