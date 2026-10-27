'use client';

import { useEffect, useRef, useState } from 'react';

const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const STARS = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁'];

export default function StarOrrery() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef({ x: -14, y: -24 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const pointerRef = useRef({ id: -1, x: 0, y: 0 });
  const draggingRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const reducedRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  const renderRotation = () => {
    const { x, y } = rotationRef.current;
    if (sceneRef.current) {
      sceneRef.current.style.transform = `rotateX(${x}deg) rotateY(${y}deg)`;
    }
  };

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedRef.current = media.matches;
    renderRotation();

    const tick = () => {
      if (!draggingRef.current && !reducedRef.current) {
        const rotation = rotationRef.current;
        const velocity = velocityRef.current;
        rotation.x += velocity.x;
        rotation.y += velocity.y + 0.035;
        velocity.x *= 0.94;
        velocity.y *= 0.94;
        if (Math.abs(velocity.x) < 0.002) velocity.x = 0;
        if (Math.abs(velocity.y) < 0.002) velocity.y = 0;
        renderRotation();
      }
      frameRef.current = window.requestAnimationFrame(tick);
    };

    const handleMotionPreference = () => {
      reducedRef.current = media.matches;
      velocityRef.current = { x: 0, y: 0 };
    };

    media.addEventListener('change', handleMotionPreference);
    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      media.removeEventListener('change', handleMotionPreference);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    draggingRef.current = true;
    velocityRef.current = { x: 0, y: 0 };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || pointerRef.current.id !== event.pointerId) return;
    const dx = event.clientX - pointerRef.current.x;
    const dy = event.clientY - pointerRef.current.y;
    pointerRef.current.x = event.clientX;
    pointerRef.current.y = event.clientY;
    rotationRef.current.x = Math.max(-68, Math.min(68, rotationRef.current.x + dy * 0.22));
    rotationRef.current.y += dx * 0.28;
    velocityRef.current = reducedRef.current ? { x: 0, y: 0 } : { x: dy * 0.035, y: dx * 0.045 };
    renderRotation();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerRef.current.id !== event.pointerId) return;
    draggingRef.current = false;
    pointerRef.current.id = -1;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 12 : 4;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
    event.preventDefault();
    velocityRef.current = { x: 0, y: 0 };
    if (event.key === 'Home') rotationRef.current = { x: -14, y: -24 };
    if (event.key === 'ArrowLeft') rotationRef.current.y -= step;
    if (event.key === 'ArrowRight') rotationRef.current.y += step;
    if (event.key === 'ArrowUp') rotationRef.current.x = Math.max(-68, rotationRef.current.x - step);
    if (event.key === 'ArrowDown') rotationRef.current.x = Math.min(68, rotationRef.current.x + step);
    renderRotation();
  };

  return (
    <div className="orrery-wrap">
      <div className="orrery-index" aria-hidden="true">
        <span>天体星环仪</span>
        <span>NO. 001 / ZI WEI</span>
      </div>
      <div
        className={`orrery-viewport${dragging ? ' is-dragging' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="group"
        aria-label="可交互紫微星环仪。拖拽或使用方向键旋转，按 Home 键复位。"
      >
        <div className="orrery-halo" aria-hidden="true" />
        <div ref={sceneRef} className="orrery-scene" aria-hidden="true">
          <div className="orrery-ring orrery-ring-outer">
            <i className="orbit-dot orbit-dot-a" />
            <i className="orbit-dot orbit-dot-b" />
          </div>
          <div className="orrery-ring orrery-ring-tilted">
            <i className="orbit-dot orbit-dot-c" />
          </div>
          <div className="orrery-ring orrery-ring-meridian" />
          <div className="orrery-disc">
            <svg viewBox="0 0 400 400" className="orrery-lines">
              <circle cx="200" cy="200" r="184" />
              <circle cx="200" cy="200" r="142" />
              <circle cx="200" cy="200" r="88" />
              {BRANCHES.map((branch, index) => {
                const angle = index * 30 * Math.PI / 180;
                const x1 = 200 + Math.sin(angle) * 88;
                const y1 = 200 - Math.cos(angle) * 88;
                const x2 = 200 + Math.sin(angle) * 184;
                const y2 = 200 - Math.cos(angle) * 184;
                return <line key={branch} x1={x1} y1={y1} x2={x2} y2={y2} />;
              })}
              <path d="M200 112 276 244 124 244Z" />
              <path d="M200 288 124 156 276 156Z" />
            </svg>
            {BRANCHES.map((branch, index) => {
              const angle = index * 30 * Math.PI / 180;
              return (
                <span
                  className="orrery-branch"
                  key={branch}
                  style={{ left: `${50 + Math.sin(angle) * 41}%`, top: `${50 - Math.cos(angle) * 41}%` }}
                >
                  {branch}
                </span>
              );
            })}
            {STARS.slice(0, 6).map((star, index) => {
              const angle = (index * 60 + 30) * Math.PI / 180;
              return (
                <span
                  className="orrery-star-label"
                  key={star}
                  style={{ left: `${50 + Math.sin(angle) * 28}%`, top: `${50 - Math.cos(angle) * 28}%` }}
                >
                  {star}
                </span>
              );
            })}
            <div className="orrery-axis">
              <span>紫</span>
              <small>ZI WEI</small>
            </div>
          </div>
          <div className="orrery-orbit-dot" />
        </div>
      </div>
      <div className="orrery-caption">
        <span><i className={dragging ? 'is-active' : ''} />拖拽旋转星盘</span>
        <span>方向键微调 · Home 复位</span>
      </div>
    </div>
  );
}
