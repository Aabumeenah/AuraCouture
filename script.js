document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));    const moduleTitles = { sanctuary: "Sanctuary Hub", aura: "Aura Weave Studio", heritage: "Living Heritage Atelier", biomimicry: "Biomimicry Fit Studio", passport: "Atelier Passport & Queue" };    let currentMuse = "harmattan";    function switchView(viewId) { if (!moduleTitles[viewId]) return; $$(".atelier-view").forEach(v => v.classList.remove("active"));
    const target = $("#" + viewId + "View"); if (target) target.classList.add("active");      $$(".nav-btn, [data-view]").forEach(btn => {
      if (btn.dataset.view === viewId) {
        btn.classList.add("active");
      } else if (btn.classList.contains("nav-btn")) {
        btn.classList.remove("active");
      }
    });

    $("#activeModuleTitle").textContent = moduleTitles[viewId];
    $("#atelierSidebar").classList.remove("open");
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (viewId === "aura" && auraRenderer) {
      setTimeout(() => {
        const container = $("#threeContainer");
        auraRenderer.setSize(container.clientWidth, container.clientHeight);
        auraCamera.aspect = container.clientWidth / container.clientHeight;
        auraCamera.updateProjectionMatrix();
      }, 50);
    }
    if (viewId === "biomimicry" && biomimicryRenderer) {
      setTimeout(() => {
        const container = $("#biomimicryContainer");
        biomimicryRenderer.setSize(container.clientWidth, container.clientHeight);
        biomimicryCamera.aspect = container.clientWidth / container.clientHeight;
        biomimicryCamera.updateProjectionMatrix();
      }, 50);
    }
  }

  document.addEventListener("click", e => {
    const trigger = e.target.closest("[data-view]");
    if (!trigger) return;
    e.preventDefault();
    switchView(trigger.dataset.view);
  });

  $("#mobileToggle").addEventListener("click", () => {
    $("#atelierSidebar").classList.toggle("open");
  });

  let toastTimer;
  function showToast(message) {
    const toast = $("#atelierToast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
  }

  let auraScene, auraCamera, auraRenderer, dressMesh;
  let biomimicryScene, biomimicryCamera, biomimicryRenderer, avatarMesh;

  const museColors = {
    harmattan: 0xD4AF37,
    midnight: 0x1B365D,
    royal: 0x7B1FA2,
    desert: 0x40916C
  };

  function initAura3D() {
    const container = $("#threeContainer");
    if (!container) return;

    auraScene = new THREE.Scene();
    auraCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    auraCamera.position.set(0, 0, 5.5);

    auraRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    auraRenderer.setSize(container.clientWidth, container.clientHeight);
    auraRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(auraRenderer.domElement);

    auraScene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(5, 5, 5);
    auraScene.add(pointLight);

    const geometry = new THREE.ConeGeometry(1.2, 3.2, 32);
    const material = new THREE.MeshStandardMaterial({ color: museColors[currentMuse], roughness: 0.3, metalness: 0.2 });
    dressMesh = new THREE.Mesh(geometry, material);
    dressMesh.position.y = -0.2;
    auraScene.add(dressMesh);

    let isDragging = false;
    let prevMouseX = 0;
    container.addEventListener("mousedown", e => { isDragging = true; prevMouseX = e.clientX; });
    window.addEventListener("mouseup", () => { isDragging = false; });
    container.addEventListener("mousemove", e => {
      if (!isDragging) return;
      dressMesh.rotation.y += (e.clientX - prevMouseX) * 0.01;
      prevMouseX = e.clientX;
    });

    animateAura();
  }

  function animateAura() {
    requestAnimationFrame(animateAura);
    if (dressMesh) dressMesh.rotation.y += 0.005;
    if (auraRenderer) auraRenderer.render(auraScene, auraCamera);
  }

  function initBiomimicry3D() {
    const container = $("#biomimicryContainer");
    if (!container) return;

    biomimicryScene = new THREE.Scene();
    biomimicryCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    biomimicryCamera.position.set(0, 0, 5.5);

    biomimicryRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    biomimicryRenderer.setSize(container.clientWidth, container.clientHeight);
    biomimicryRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(biomimicryRenderer.domElement);

    biomimicryScene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(5, 5, 5);
    biomimicryScene.add(pointLight);

    const geometry = new THREE.CylinderGeometry(0.8, 1.1, 3.2, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0xD4AF37, wireframe: true, roughness: 0.2 });
    avatarMesh = new THREE.Mesh(geometry, material);
    biomimicryScene.add(avatarMesh);

    animateBiomimicry();
  }

  function animateBiomimicry() {
    requestAnimationFrame(animateBiomimicry);
    if (avatarMesh) avatarMesh.rotation.y += 0.004;
    if (biomimicryRenderer) biomimicryRenderer.render(biomimicryScene, biomimicryCamera);
  }

  $$(".muse-btn").forEach(btn => { btn.addEventListener("click", () => { $$
(".muse-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentMuse = btn.dataset.muse;
      if (dressMesh) dressMesh.material.color.setHex(museColors[currentMuse]);
      showToast("Aura Weave updated to " + btn.querySelector("strong").textContent);
    });
  });

  $("#regenerateAura").addEventListener("click", () => {
    if (dressMesh) {
      dressMesh.scale.set(1.05, 0.98, 1.05);
      setTimeout(() => dressMesh.scale.set(1, 1, 1), 300);
    }
    showToast("Generative textile pattern recalculated.");
  });

  const sliderBust = $("#sliderBust"), sliderWaist = $("#sliderWaist"), sliderHip = $("#sliderHip"), sliderHeight = $("#sliderHeight");
  [sliderBust, sliderWaist, sliderHip, sliderHeight].forEach(slider => {
    slider.addEventListener("input", () => {
      $("#valBust").textContent = sliderBust.value;
      $("#valWaist").textContent = sliderWaist.value;
      $("#valHip").textContent = sliderHip.value;
      $("#valHeight").textContent = sliderHeight.value; if (avatarMesh) { avatarMesh.scale.set(sliderBust.value / 96, sliderHeight.value / 168, sliderHip.value / 104); } }); });    const heritageData = { neckline: { title: "Royal Crown Neckline", text: "Inspired by traditional Yoruba embroidery motifs, representing dignity and royal lineage." }, core: { title: "Adire Resist-Dyed Core", text: "Utilizing ancestral indigo and cassava starch resist techniques (Eleko)." }, hem: { title: "Flowing Heritage Hem", text: "Weighted silk-crepe panels designed to cascade gracefully with movement." } };    $$(".hotspot-target").forEach(hotspot => {
    hotspot.addEventListener("click", () => {
      const data = heritageData[hotspot.dataset.hotspot];
      if (!data) return;
      $("#heritageInfoPanel").innerHTML = `<h3>${data.title}</h3><p>${data.text}</p>`;
      showToast("Loaded narrative for " + data.title);
    });
  });

  $("#transmitOrderBtn").addEventListener("click", () => showToast("Atelier Passport transmitted successfully!"));
  $("#downloadPassportBtn").addEventListener("click", () => {
    const data = { id: $("#passportId").textContent, muse: currentMuse, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "AuraCouture_Passport.json"; a.click();
    URL.revokeObjectURL(url);
    showToast("Passport JSON downloaded.");
  });

  initAura3D();
  initBiomimicry3D();
});
