'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Decorative "molecule network" rendered as the fixed full-page landing
 * backdrop: a slowly drifting particle cloud in brand colors with
 * constellation links, gentle rotation, pointer parallax, and a subtle
 * scroll-linked drift.
 *
 * Budget rules: DPR capped at 2, ~380 particles, links precomputed once,
 * animation pauses when the tab is hidden, and reduced-motion users get a
 * single static frame.
 */

const PARTICLE_COUNT = 380;
const LINK_DISTANCE = 3.4;
const MAX_LINKS = 1000;
const PALETTE = ['#2563eb', '#0d9488', '#2563eb', '#7c3aed', '#1e40af', '#0ea5e9'];

function createDotTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.35, 'rgba(255,255,255,0.85)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  return new THREE.CanvasTexture(canvas);
}

export default function MoleculeField() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      });
    } catch {
      return; // No WebGL — the hero simply keeps its gradient background.
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog('#ffffff', 18, 34);

    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 100);
    camera.position.set(0, 0, 20);

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    // Wide, flat ellipsoid with a clearer center so headline text stays readable.
    const basePositions = new Float32Array(PARTICLE_COUNT * 3);
    const livePositions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const phases = new Float32Array(PARTICLE_COUNT);
    const speeds = new Float32Array(PARTICLE_COUNT);
    const color = new THREE.Color();

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const radius = 6 + 10 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      basePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta) * 1.7;
      basePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.75;
      basePositions[i * 3 + 2] = radius * Math.cos(phi) * 0.55;
      color.set(PALETTE[i % PALETTE.length]);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.35 + Math.random() * 0.5;
    }
    livePositions.set(basePositions);

    const pointsGeometry = new THREE.BufferGeometry();
    const pointsAttribute = new THREE.BufferAttribute(livePositions, 3);
    pointsGeometry.setAttribute('position', pointsAttribute);
    pointsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const dotTexture = createDotTexture();
    const pointsMaterial = new THREE.PointsMaterial({
      size: 0.5,
      map: dotTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(pointsGeometry, pointsMaterial);

    // Neighbor links, computed once from base positions.
    const linkPairs: number[] = [];
    for (let i = 0; i < PARTICLE_COUNT && linkPairs.length / 2 < MAX_LINKS; i += 1) {
      for (let j = i + 1; j < PARTICLE_COUNT; j += 1) {
        const dx = basePositions[i * 3] - basePositions[j * 3];
        const dy = basePositions[i * 3 + 1] - basePositions[j * 3 + 1];
        const dz = basePositions[i * 3 + 2] - basePositions[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < LINK_DISTANCE * LINK_DISTANCE) {
          linkPairs.push(i, j);
          if (linkPairs.length / 2 >= MAX_LINKS) break;
        }
      }
    }

    const linePositions = new Float32Array(linkPairs.length * 3);
    const lineGeometry = new THREE.BufferGeometry();
    const lineAttribute = new THREE.BufferAttribute(linePositions, 3);
    lineGeometry.setAttribute('position', lineAttribute);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: '#94a3b8',
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);

    const group = new THREE.Group();
    group.add(points);
    group.add(lines);
    scene.add(group);

    const pointer = { x: 0, y: 0 };
    const smoothed = { x: 0, y: 0 };
    const scroll = { target: 0, current: 0 };
    const clock = new THREE.Clock();

    const syncSize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    syncSize();

    const renderFrame = () => {
      const elapsed = clock.getElapsedTime();

      for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        const wobble = Math.sin(elapsed * speeds[i] + phases[i]) * 0.4;
        livePositions[i * 3] = basePositions[i * 3] + wobble;
        livePositions[i * 3 + 1] =
          basePositions[i * 3 + 1] + Math.cos(elapsed * speeds[i] * 0.8 + phases[i]) * 0.4;
        livePositions[i * 3 + 2] = basePositions[i * 3 + 2] + wobble * 0.5;
      }
      pointsAttribute.needsUpdate = true;

      for (let k = 0; k < linkPairs.length; k += 1) {
        const p = linkPairs[k];
        linePositions[k * 3] = livePositions[p * 3];
        linePositions[k * 3 + 1] = livePositions[p * 3 + 1];
        linePositions[k * 3 + 2] = livePositions[p * 3 + 2];
      }
      lineAttribute.needsUpdate = true;

      smoothed.x += (pointer.x - smoothed.x) * 0.06;
      smoothed.y += (pointer.y - smoothed.y) * 0.06;
      scroll.current += (scroll.target - scroll.current) * 0.06;
      group.rotation.y = elapsed * 0.045 + smoothed.x * 0.3;
      group.rotation.x = smoothed.y * 0.18 + scroll.current * 0.35;
      camera.position.y = -scroll.current * 4;

      renderer.render(scene, camera);
    };

    let frameId = 0;
    let running = false;
    let visible = true;

    const loop = () => {
      frameId = requestAnimationFrame(loop);
      renderFrame();
    };
    const start = () => {
      if (running || reducedMotion || document.hidden || !visible) return;
      running = true;
      loop();
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frameId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX / window.innerWidth - 0.5;
      pointer.y = event.clientY / window.innerHeight - 0.5;
    };
    const handleScroll = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      scroll.target = Math.min(1, window.scrollY / max);
    };
    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          start();
        } else {
          stop();
        }
      },
      { threshold: 0.05 },
    );
    intersection.observe(container);

    const resize = new ResizeObserver(() => {
      syncSize();
      if (!running) renderFrame();
    });
    resize.observe(container);

    if (!reducedMotion) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      window.addEventListener('scroll', handleScroll, { passive: true });
      document.addEventListener('visibilitychange', handleVisibility);
      handleScroll();
      start();
    } else {
      renderFrame();
    }

    return () => {
      stop();
      intersection.disconnect();
      resize.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibility);
      pointsGeometry.dispose();
      lineGeometry.dispose();
      pointsMaterial.dispose();
      lineMaterial.dispose();
      dotTexture.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} aria-hidden className="absolute inset-0" />;
}
