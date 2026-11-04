'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ForestCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070b09, 0.035);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 2.5, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0x22382e, 1.8);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0xa5d6a7, 2.5);
    moonLight.position.set(5, 12, 7);
    scene.add(moonLight);

    const pointLight = new THREE.PointLight(0x52b788, 3, 15);
    pointLight.position.set(0, 2, 4);
    scene.add(pointLight);

    // --- Ground Mesh ---
    const groundGeo = new THREE.PlaneGeometry(60, 60, 48, 48);
    // Subtle elevation displacement on vertices
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const elevation = Math.sin(vx * 0.3) * Math.cos(vy * 0.3) * 0.4 + Math.sin(vx * 0.8) * 0.2;
      pos.setZ(i, elevation);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0a140f,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);

    // --- Trees Generation ---
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x163828,
      roughness: 0.75,
      metalness: 0.1,
      flatShading: true,
    });
    const foliageMat2 = new THREE.MeshStandardMaterial({
      color: 0x0e261b,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
    });
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x221812,
      roughness: 0.9,
    });

    const trunkGeo = new THREE.CylinderGeometry(0.08, 0.14, 1.2, 5);
    const foliageGeo1 = new THREE.ConeGeometry(0.85, 1.4, 5);
    const foliageGeo2 = new THREE.ConeGeometry(0.68, 1.2, 5);
    const foliageGeo3 = new THREE.ConeGeometry(0.48, 0.9, 5);

    const treeGroup = new THREE.Group();

    // Create a forest layout (leaving the center path clear)
    const treeCount = 75;
    for (let i = 0; i < treeCount; i++) {
      let x = (Math.random() - 0.5) * 36;
      let z = (Math.random() - 0.5) * 30 - 2;

      // Keep center stage somewhat open for the text
      if (Math.abs(x) < 3.2 && z > -3) {
        x += x >= 0 ? 3.5 : -3.5;
      }

      const singleTree = new THREE.Group();

      const scale = 0.65 + Math.random() * 0.9;
      singleTree.scale.set(scale, scale, scale);

      // Trunk
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.6;
      singleTree.add(trunk);

      // Foliage tiers
      const mat = Math.random() > 0.5 ? foliageMat : foliageMat2;
      const cone1 = new THREE.Mesh(foliageGeo1, mat);
      cone1.position.y = 1.3;
      singleTree.add(cone1);

      const cone2 = new THREE.Mesh(foliageGeo2, mat);
      cone2.position.y = 2.0;
      singleTree.add(cone2);

      const cone3 = new THREE.Mesh(foliageGeo3, mat);
      cone3.position.y = 2.6;
      singleTree.add(cone3);

      singleTree.position.set(x, -0.4, z);
      singleTree.rotation.y = Math.random() * Math.PI * 2;

      treeGroup.add(singleTree);
    }
    scene.add(treeGroup);

    // --- Floating Glowing Spores / Fireflies ---
    const sporeCount = 180;
    const sporeGeo = new THREE.BufferGeometry();
    const sporePositions = new Float32Array(sporeCount * 3);
    const sporeSpeeds = new Float32Array(sporeCount);

    for (let i = 0; i < sporeCount; i++) {
      sporePositions[i * 3] = (Math.random() - 0.5) * 20;
      sporePositions[i * 3 + 1] = Math.random() * 6;
      sporePositions[i * 3 + 2] = (Math.random() - 0.5) * 16;
      sporeSpeeds[i] = 0.003 + Math.random() * 0.008;
    }

    sporeGeo.setAttribute('position', new THREE.BufferAttribute(sporePositions, 3));

    const sporeMat = new THREE.PointsMaterial({
      color: 0x95d5b2,
      size: 0.09,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const spores = new THREE.Points(sporeGeo, sporeMat);
    scene.add(spores);

    // --- Interactive Mouse Parallax ---
    let targetX = 0;
    let targetY = 2.5;
    let currentX = 0;
    let currentY = 2.5;

    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetX = normX * 1.5;
      targetY = 2.5 + normY * 0.6;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // --- Resize Handler ---
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // --- Animation Loop ---
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Camera smooth interpolation
      currentX += (targetX - currentX) * 0.04;
      currentY += (targetY - currentY) * 0.04;
      camera.position.x = currentX;
      camera.position.y = currentY;
      camera.lookAt(0, 1.8, -4);

      // Tree gentle sway
      treeGroup.children.forEach((tree, idx) => {
        tree.rotation.z = Math.sin(elapsedTime * 1.2 + idx) * 0.015;
      });

      // Spores motion
      const positions = sporeGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < sporeCount; i++) {
        positions[i * 3 + 1] += sporeSpeeds[i];
        positions[i * 3] += Math.sin(elapsedTime + i) * 0.002;
        if (positions[i * 3 + 1] > 7) {
          positions[i * 3 + 1] = 0;
        }
      }
      sporeGeo.attributes.position.needsUpdate = true;

      // Subtle light pulse
      pointLight.intensity = 2.5 + Math.sin(elapsedTime * 2) * 0.7;

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      groundGeo.dispose();
      groundMat.dispose();
      trunkGeo.dispose();
      trunkMat.dispose();
      foliageGeo1.dispose();
      foliageGeo2.dispose();
      foliageGeo3.dispose();
      foliageMat.dispose();
      foliageMat2.dispose();
      sporeGeo.dispose();
      sporeMat.dispose();

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}

