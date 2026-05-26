/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo, useEffect, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  Text,
  Float,
  ContactShadows,
  Html,
  Grid,
  MeshReflectorMaterial,
  useGLTF
} from '@react-three/drei';
import { createXRStore, XR, XRButton } from '@react-three/xr';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import gsap from 'gsap';
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

// Initialize RectAreaLight uniforms
RectAreaLightUniformsLib.init();

// Create XR store for VR support
const store = createXRStore();

interface PanelProps {
  position: [number, number, number];
  rotation: [number, number, number];
  index: number;
  onSelect: (pos: [number, number, number], subId: number) => void;
  targetSubId: number | null;
}

function PathArrow({ position, target, index }: { position: [number, number, number], target: [number, number, number], index: number }) {
  const ref = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.position.set(...position);
      ref.current.lookAt(...target);
    }
  }, [position, target]);

  useFrame((state) => {
    if (materialRef.current) {
      // Flowing animation effect: opacity pulses based on time and index
      materialRef.current.opacity = 0.2 + 0.8 * Math.max(0, Math.sin(state.clock.elapsedTime * 8 - index * 0.5));
    }
  });

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.3);
    s.lineTo(0.2, -0.1);
    s.lineTo(0.08, -0.1);
    s.lineTo(0.08, -0.4);
    s.lineTo(-0.08, -0.4);
    s.lineTo(-0.08, -0.1);
    s.lineTo(-0.2, -0.1);
    s.closePath();
    return s;
  }, []);

  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial ref={materialRef} color="#ff3333" transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

interface ActivePanel {
  id: number;
  status: string;
  description: string;
}

interface Operation {
  id: number;
  panelId: number;
  unitId: string;
  panelName: string;
  opType: 'KEY CLOSED' | 'KEY OPEN' | 'KEY ALERT';
  operator: string;
  department: string;
  purpose: string;
  status: '완료' | '진행중' | '실패';
  notes: string;
  operatedAt: string;
}

const GLB_SCALE = 0.02;
const GLB_SCALE_Y = GLB_SCALE * 1.65; // 높이 기존 1.5배에서 10% 추가 증가

interface PanelInfo {
  glbKey: string;
  unitId: string;
  name: string;
  type: string;
  systemCode: string;
  systemName: string;
  groupCode: string;
  groupMcs: string;
}

const PANEL_DATA: Record<number, PanelInfo> = {
  //오른쪽 캐비겟 앞에서 KOEN글씨쪽으로 증가 (1->24)
  1: { glbKey: 'A', unitId: 'UNIT-10E', name: 'PAF-C', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  2: { glbKey: 'A', unitId: 'UNIT-10F', name: 'PAF-D', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  3: { glbKey: 'A', unitId: 'UNIT-10C', name: 'PAF-A', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  4: { glbKey: 'A', unitId: 'UNIT-10D', name: 'PAF-B', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  5: { glbKey: 'F', unitId: 'UNIT-10A', name: 'BUS DUCT COMPARTMENT', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  6: { glbKey: 'A', unitId: 'UNIT-10B', name: 'FDF-A', type: '차단기', systemCode: '531140', systemName: '#1 통풍계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  7: { glbKey: 'B', unitId: 'UNIT-09A', name: 'PC TR UNIT-A', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  8: { glbKey: 'B', unitId: 'UNIT-09B', name: 'IDF-A', type: '차단기', systemCode: '531140', systemName: '#1 통풍계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  9: { glbKey: 'A', unitId: 'UNIT-08A', name: 'COP-A', type: '차단기', systemCode: '531260', systemName: '#1 급수계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  10: { glbKey: 'A', unitId: 'UNIT-08B', name: 'COP-B', type: '차단기', systemCode: '531260', systemName: '#1 급수계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  11: { glbKey: 'A', unitId: 'UNIT-07A', name: 'MTR SPARE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  12: { glbKey: 'A', unitId: 'UNIT-07B', name: 'STAGE 2 HAMMER MILL', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  13: { glbKey: 'A', unitId: 'UNIT-06A', name: 'VERTICAL MILL C', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  14: { glbKey: 'A', unitId: 'UNIT-06B', name: 'VERTICAL MILL D', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  15: { glbKey: 'A', unitId: 'UNIT-05A', name: 'VERTICAL MILL A', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  16: { glbKey: 'A', unitId: 'UNIT-05B', name: 'VERTICAL MILL B', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  17: { glbKey: 'A', unitId: 'UNIT-04A', name: 'BFP-A', type: '차단기', systemCode: '531260', systemName: '#1 급수계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  18: { glbKey: 'A', unitId: 'UNIT-04B', name: 'BFP-B', type: '차단기', systemCode: '531260', systemName: '#1 급수계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  19: { glbKey: 'A', unitId: 'UNIT-03A', name: 'IDF-B', type: '차단기', systemCode: '531140', systemName: '#1 통풍계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  20: { glbKey: 'A', unitId: 'UNIT-03B', name: 'FDF-B', type: '차단기', systemCode: '531140', systemName: '#1 통풍계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  21: { glbKey: 'B', unitId: 'UNIT-02A', name: 'PC TR UNIT-B', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  22: { glbKey: 'B', unitId: 'UNIT-02B', name: '#2 BIOMASS STORAGE BACK-UP TO DS반', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  23: { glbKey: 'E', unitId: 'UNIT-01A', name: 'AUX COMPARTMENT', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  24: { glbKey: 'D', unitId: 'UNIT-01B', name: 'AUX TR INCOMING', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },

  //왼쪽캐비겟 KOEN글씨쪽에서  앞으로 증가(25->47)
  25: { glbKey: 'C', unitId: 'COM-20A', name: 'AUX COMPARTMENT', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  26: { glbKey: 'D', unitId: 'COM-20B', name: 'START-UP TR INCOMING', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  27: { glbKey: 'A', unitId: 'COM-19A', name: 'MOTOR SPARE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  28: { glbKey: 'B', unitId: 'COM-19B', name: 'INTAKE FEEDER', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  29: { glbKey: 'B', unitId: 'COM-18A', name: 'PC TR COM-B', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  30: { glbKey: 'B', unitId: 'COM-18B', name: 'FGD', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  31: { glbKey: 'B', unitId: 'COM-17A', name: 'NO.2 2D BUS TIE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  32: { glbKey: 'B', unitId: 'COM-17B', name: 'NON MOTOR SPARE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  33: { glbKey: 'B', unitId: 'COM-16A', name: 'NO.2 2C BUS TIE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  34: { glbKey: 'B', unitId: 'COM-16B', name: 'PC TR COM-A', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  35: { glbKey: 'A', unitId: 'COM-15A', name: '#1신사옥 TO DS반', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  36: { glbKey: 'A', unitId: 'COM-15B', name: 'BFP-C', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  37: { glbKey: 'B', unitId: 'COM-14A', name: 'FLY ASH SYSTEM', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  38: { glbKey: 'A', unitId: 'COM-14B', name: 'ASP-B', type: '차단기', systemCode: '533140', systemName: '#1,2 회처리계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  39: { glbKey: 'B', unitId: 'COM-13A', name: '#3 BIOMASS STORAGE TO DS반', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  40: { glbKey: 'B', unitId: 'COM-13B', name: 'UNIT-COM BUS TIE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  41: { glbKey: 'A', unitId: 'UNIT-12A', name: 'MOTOR SPARE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  42: { glbKey: 'A', unitId: 'UNIT-12B', name: 'ASP-A', type: '차단기', systemCode: '531160', systemName: '#1 회처리계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  43: { glbKey: 'F', unitId: 'UNIT-11A', name: 'BUS DUCT COMPARTMENT', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  44: { glbKey: 'A', unitId: 'UNIT-11B', name: 'HGRF', type: '차단기', systemCode: '531140', systemName: '#1 통풍계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  45: { glbKey: 'A', unitId: 'UNIT-10G', name: 'STAGE 1 HAMMER MILL', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  46: { glbKey: 'B', unitId: 'UNIT-10H', name: 'NON MOTOR SPARE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  47: { glbKey: 'G', unitId: 'UNIT-10I', name: 'STAGE 1 HAMMER MILL VC', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
};

interface Placement {
  key: string;
  position: [number, number, number];
  rotation: [number, number, number];
  panelId: number;
  desc: string;
  unitId: string;
  doubleHeight?: boolean;
}

const GLBClone = React.memo(function GLBClone({ baseScene, position, rotation, glbBox, panelId, desc, unitId, isBlinking, doubleHeight }: {
  baseScene: THREE.Group;
  position: [number, number, number];
  rotation: [number, number, number];
  glbBox: THREE.Box3;
  panelId: number;
  desc: string;
  unitId: string;
  isBlinking: boolean;
  doubleHeight?: boolean;
}) {
  const cloned = useMemo(() => baseScene.clone(), [baseScene]);
  const groupRef = useRef<THREE.Group>(null);
  const blinkOverlayRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (!blinkOverlayRef.current) return;
    if (isBlinking) {
      const isOn = Math.floor(clock.elapsedTime * 6) % 2 === 0;
      blinkOverlayRef.current.opacity = isOn ? 0.55 : 0;
    } else {
      blinkOverlayRef.current.opacity = 0;
    }
  });

  // 목표 틀 크기 (하나의 판넬 칸 기준)
  const TARGET_PW = 2.0;
  const TARGET_PH = 2.5;
  const TARGET_PD = 1.0;

  const { finalScale, cx, cy, fz, pw, ph } = useMemo(() => {
    const size = glbBox.getSize(new THREE.Vector3());
    const center = glbBox.getCenter(new THREE.Vector3());

    // 모델을 틀에 꽉 채우기 위한 스케일 계산
    const currentPH = doubleHeight ? TARGET_PH * 2.07 : TARGET_PH;
    const currentPD = doubleHeight ? TARGET_PD * 0.96 : TARGET_PD; // 두께 살짝 보정 (47번 등)
    const scaleX = TARGET_PW / size.x;
    const scaleY = currentPH / size.y;
    const scaleZ = currentPD / size.z;

    return {
      finalScale: [scaleX, scaleY, scaleZ] as [number, number, number],
      cx: 0, // 중앙 정렬 위해 0
      cy: currentPH / 2, // 바닥 기준 절반 높이
      fz: currentPD / 2 + 0.002, // 앞면 돌출
      pw: TARGET_PW,
      ph: currentPH,
      modelOffset: [-center.x * scaleX, -glbBox.min.y * scaleY, -center.z * scaleZ]
    };
  }, [glbBox, doubleHeight]);

  const { modelOffset } = useMemo(() => {
    const size = glbBox.getSize(new THREE.Vector3());
    const scaleX = TARGET_PW / size.x;
    const currentPH = doubleHeight ? TARGET_PH * 2 : TARGET_PH;
    const currentPD = doubleHeight ? TARGET_PD * 0.98 : TARGET_PD;
    const scaleY = currentPH / size.y;
    const scaleZ = currentPD / size.z;
    const center = glbBox.getCenter(new THREE.Vector3());
    return {
      modelOffset: [-center.x * scaleX, -glbBox.min.y * scaleY, -center.z * scaleZ] as [number, number, number]
    };
  }, [glbBox, doubleHeight]);

  const fontPh = TARGET_PH;

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* 모델링 파일을 틀 중앙/바닥 기준으로 배치 */}
      <primitive object={cloned} scale={finalScale} position={modelOffset} />

      {/* 앞면 전체 블링킹 오버레이 */}
      <mesh position={[cx, cy, fz + 0.0005]}>
        <planeGeometry args={[pw, ph]} />
        <meshBasicMaterial ref={blinkOverlayRef} color="#dd1111" transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 명판 엠보싱 그림자 (80%) */}
      <mesh position={[cx, cy + ph * 0.327, fz + 0.002]}>
        <planeGeometry args={[pw * 0.742, ph * 0.254]} />
        <meshStandardMaterial color="#05080d" metalness={0} roughness={1} transparent opacity={0.4} />
      </mesh>

      {/* 정밀 CNC 아노다이징 프레임 (80%) */}
      <mesh position={[cx, cy + ph * 0.33, fz + 0.003]}>
        <planeGeometry args={[pw * 0.726, ph * 0.245]} />
        <meshStandardMaterial color="#1b2434" metalness={1.0} roughness={0.20} envMapIntensity={1.6} />
      </mesh>

      {/* 명판 본체 — 브러시드 알루미늄 (80%) */}
      <mesh position={[cx, cy + ph * 0.33, fz + 0.004]}>
        <planeGeometry args={[pw * 0.700, ph * 0.218]} />
        <meshStandardMaterial color="#c2ccd5" metalness={0.78} roughness={0.14} envMapIntensity={3.0} />
      </mesh>

      {/* 기기번호 */}
      <Text
        position={[cx, cy + ph * 0.358, fz + 0.006]}
        fontSize={fontPh * 0.056}
        color="#08111e"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        letterSpacing={0.06}
        textAlign="center"
        font="/fonts/Pretendard-Bold.woff"
      >
        {unitId}
      </Text>

      {/* 기기명 */}
      <Text
        position={[cx, cy + ph * 0.302, fz + 0.006]}
        fontSize={fontPh * 0.040}
        color="#243245"
        anchorX="center"
        anchorY="middle"
        maxWidth={pw * 0.65}
        textAlign="center"
        font="/fonts/Pretendard-Bold.woff"
      >
        {desc}
      </Text>
    </group>
  );
});

function getDesc(panelId: number): string {
  return PANEL_DATA[panelId]?.name ?? `PANEL ${panelId}`;
}
function getUnitId(panelId: number): string {
  return PANEL_DATA[panelId]?.unitId ?? String(panelId).padStart(2, '0');
}
function getGlbKey(panelId: number): string {
  return PANEL_DATA[panelId]?.glbKey ?? 'A';
}

const GLB_VERSION = "v1.1";

const GLBGrid = React.memo(function GLBGrid({ blinkingIds }: { blinkingIds: number[] }) {
  const { scene: sceneA } = useGLTF(`/A.glb?v=${GLB_VERSION}`);
  const { scene: sceneB } = useGLTF(`/B.glb?v=${GLB_VERSION}`);
  const { scene: sceneC } = useGLTF(`/C.glb?v=${GLB_VERSION}`);
  const { scene: sceneD } = useGLTF(`/D.glb?v=${GLB_VERSION}`);
  const { scene: sceneE } = useGLTF(`/E.glb?v=${GLB_VERSION}`);
  const { scene: sceneF } = useGLTF(`/F.glb?v=${GLB_VERSION}`);
  const { scene: sceneG } = useGLTF(`/G.glb?v=${GLB_VERSION}`);

  const sceneMap: Record<string, THREE.Group> = useMemo(
    () => ({ A: sceneA, B: sceneB, C: sceneC, D: sceneD, E: sceneE, F: sceneF, G: sceneG }),
    [sceneA, sceneB, sceneC, sceneD, sceneE, sceneF, sceneG]
  );

  const boxMap = useMemo(() => ({
    A: new THREE.Box3().setFromObject(sceneA),
    B: new THREE.Box3().setFromObject(sceneB),
    C: new THREE.Box3().setFromObject(sceneC),
    D: new THREE.Box3().setFromObject(sceneD),
    E: new THREE.Box3().setFromObject(sceneE),
    F: new THREE.Box3().setFromObject(sceneF),
    G: new THREE.Box3().setFromObject(sceneG),
  }), [sceneA, sceneB, sceneC, sceneD, sceneE, sceneF, sceneG]);

  const colWidth = 2.0;
  const floorHeight = 2.5;
  const START_X = 11;
  const ROW_Z: [number, number] = [-4.9, 4.9];

  const placements = useMemo<Placement[]>(() => {
    const items: Placement[] = [];

    // Right Side (Row 1): Entry(1,2) -> KOEN(23,24)
    for (let col = 0; col < 12; col++) {
      for (let floor = 0; floor < 2; floor++) {
        const isUpper = floor === 1;
        const panelId = col * 2 + (isUpper ? 1 : 2);
        items.push({
          key: `r1-c${col}-f${floor}`,
          position: [START_X + col * colWidth, floor * floorHeight, ROW_Z[1]],
          rotation: [0, Math.PI, 0],
          panelId,
          desc: getDesc(panelId),
          unitId: getUnitId(panelId),
        });
      }
    }

    // Left Side (Row 0): Entry(47) -> KOEN(25,26)
    for (let col = 0; col < 12; col++) {
      if (col === 0) {
        // Special 47 panel (Single in its cabinet location)
        items.push({
          key: `r0-c0-merged`,
          position: [START_X + col * colWidth, 0, ROW_Z[0]],
          rotation: [0, 0, 0],
          panelId: 47,
          desc: getDesc(47),
          unitId: getUnitId(47),
          doubleHeight: true,
        });
        continue;
      }

      for (let floor = 0; floor < 2; floor++) {
        const isUpper = floor === 1;
        const panelId = (47 - (col * 2)) + (isUpper ? 0 : 1);
        items.push({
          key: `r0-c${col}-f${floor}`,
          position: [START_X + col * colWidth, floor * floorHeight, ROW_Z[0]],
          rotation: [0, 0, 0],
          panelId,
          desc: getDesc(panelId),
          unitId: getUnitId(panelId),
        });
      }
    }
    return items;
  }, [colWidth, floorHeight]);

  return (
    <>
      {placements.map(({ key, position, rotation, panelId, desc, unitId, doubleHeight }) => {
        const glbKey = getGlbKey(panelId);
        return (
          <GLBClone
            key={key}
            baseScene={sceneMap[glbKey]}
            position={position}
            rotation={rotation}
            glbBox={boxMap[glbKey as keyof typeof boxMap]}
            panelId={panelId}
            desc={desc}
            unitId={unitId}
            isBlinking={blinkingIds.includes(panelId)}
            doubleHeight={doubleHeight}
          />
        );
      })}
    </>
  );
});
useGLTF.preload(`/A.glb?v=${GLB_VERSION}`);
useGLTF.preload(`/B.glb?v=${GLB_VERSION}`);
useGLTF.preload(`/C.glb?v=${GLB_VERSION}`);
useGLTF.preload(`/D.glb?v=${GLB_VERSION}`);
useGLTF.preload(`/E.glb?v=${GLB_VERSION}`);
useGLTF.preload(`/F.glb?v=${GLB_VERSION}`);
useGLTF.preload(`/G.glb?v=${GLB_VERSION}`);
useGLTF.preload(`/floor.glb?v=${GLB_VERSION}`);
useGLTF.preload(`/ceiling.glb?v=${GLB_VERSION}`);

const DEPARTMENTS = ['전기팀', '운전팀', '환경팀', '정비팀', '안전팀', '계측팀', '토목팀', '기계팀'];
const REASONS = ['정기 점검 후 복전', '설비 보수·교체', '예방 정비', '절연 시험', '부하 시험', '긴급 복전', '계획 개방', '기타'];

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
const REG_SELECT_CLS = "bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer";

function RegistrationModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = React.useState({
    requestDept: '', reason: '',
  });
  const [selectedPanelIds, setSelectedPanelIds] = React.useState<number[]>([]);
  const [panelSearch, setPanelSearch] = React.useState('');
  const [showSearch, setShowSearch] = React.useState(false);
  const [showQR, setShowQR] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const panelOptions = Object.entries(PANEL_DATA).map(([id, info]) => ({ id: Number(id), unitId: info.unitId, name: info.name }));
  const filtered = panelSearch.length > 0
    ? panelOptions.filter(p => p.unitId.toLowerCase().includes(panelSearch.toLowerCase()) || p.name.toLowerCase().includes(panelSearch.toLowerCase()) || String(p.id).includes(panelSearch))
    : panelOptions;

  const togglePanel = (id: number) =>
    setSelectedPanelIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const sel = (f: Partial<typeof form>) => setForm(prev => ({ ...prev, ...f }));
  const isValid = form.requestDept && form.reason && selectedPanelIds.length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await Promise.all(selectedPanelIds.map(pid => {
        const info = PANEL_DATA[pid];
        return fetch('/api/operations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            panelId: pid, unitId: info?.unitId ?? '', panelName: info?.name ?? '',
            opType: 'KEY CLOSED', operator: form.requestDept, department: form.requestDept,
            purpose: form.reason, notes: '',
          }),
        });
      }));
      setSuccess(true);
      setTimeout(onClose, 1400);
    } catch { setSubmitting(false); }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0f1623] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/70 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6B5EF8]/20 border border-[#6B5EF8]/40 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </div>
            <div><p className="text-white font-bold text-base">조작 등록</p><p className="text-slate-500 text-[10px] tracking-widest uppercase">REGISTER</p></div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-900/60 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <p className="text-emerald-400 font-bold">조작 등록 완료</p>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4">

            {/* 작업요청부서 / 작업요청사유 나란히 */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="작업요청부서" required>
                <select value={form.requestDept} onChange={e => sel({ requestDept: e.target.value })} className={REG_SELECT_CLS}>
                  <option value="">— 선택 —</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="작업요청사유" required>
                <select value={form.reason} onChange={e => sel({ reason: e.target.value })} className={REG_SELECT_CLS}>
                  <option value="">— 선택 —</option>
                  {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
            </div>

            {/* 차단기 선택 */}
            <Field label="차단기 선택" required>
              <div className="flex gap-2">
                <button onClick={() => { setShowQR(true); setShowSearch(false); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-all ${showQR ? 'bg-[#6B5EF8] border-violet-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="3" height="3" /><rect x="18" y="18" width="3" height="3" /></svg>
                  QR 스캔
                </button>
                <button onClick={() => { setShowSearch(true); setShowQR(false); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-all ${showSearch ? 'bg-[#6B5EF8] border-violet-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  검색
                </button>
              </div>

              {/* QR 패널 */}
              {showQR && (
                <div className="flex flex-col items-center gap-3 p-4 bg-slate-800/60 border border-slate-700 rounded-xl mt-1">
                  <div className="w-36 h-36 bg-white rounded-xl flex items-center justify-center">
                    <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                      <rect x="5" y="5" width="35" height="35" rx="4" fill="#1a1a2e" /><rect x="12" y="12" width="21" height="21" rx="2" fill="white" /><rect x="18" y="18" width="9" height="9" fill="#1a1a2e" />
                      <rect x="60" y="5" width="35" height="35" rx="4" fill="#1a1a2e" /><rect x="67" y="12" width="21" height="21" rx="2" fill="white" /><rect x="73" y="18" width="9" height="9" fill="#1a1a2e" />
                      <rect x="5" y="60" width="35" height="35" rx="4" fill="#1a1a2e" /><rect x="12" y="67" width="21" height="21" rx="2" fill="white" /><rect x="18" y="73" width="9" height="9" fill="#1a1a2e" />
                      <rect x="60" y="60" width="9" height="9" fill="#1a1a2e" /><rect x="75" y="60" width="9" height="9" fill="#1a1a2e" /><rect x="60" y="75" width="9" height="9" fill="#1a1a2e" /><rect x="75" y="75" width="9" height="9" fill="#1a1a2e" />
                      <rect x="45" y="45" width="9" height="9" fill="#1a1a2e" />
                    </svg>
                  </div>
                  <p className="text-slate-400 text-xs text-center">바코드를 인식시켜 주세요</p>
                </div>
              )}

              {/* 검색 + 체크리스트 */}
              {showSearch && (
                <div className="flex flex-col gap-2 mt-1">
                  <input value={panelSearch} onChange={e => setPanelSearch(e.target.value)}
                    placeholder="기기번호 또는 기기명 검색..."
                    className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                  <div className="max-h-52 overflow-y-auto flex flex-col gap-0.5 bg-slate-900 border border-slate-700 rounded-xl p-1.5">
                    {filtered.length === 0 ? (
                      <p className="text-slate-500 text-xs text-center py-3">검색 결과 없음</p>
                    ) : filtered.map(p => {
                      const checked = selectedPanelIds.includes(p.id);
                      return (
                        <label key={p.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${checked ? 'bg-indigo-950/50' : 'hover:bg-slate-800'}`}>
                          <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${checked ? 'bg-[#6B5EF8] border-violet-500' : 'bg-slate-700 border-slate-600'}`}>
                            {checked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                          </div>
                          <input type="checkbox" className="hidden" checked={checked} onChange={() => togglePanel(p.id)} />
                          <span className="text-slate-500 font-mono text-xs w-5 shrink-0">{String(p.id).padStart(2, '0')}</span>
                          <span className="text-indigo-300 font-mono text-xs font-bold shrink-0">{p.unitId}</span>
                          <span className="text-slate-300 text-xs truncate">{p.name}</span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs text-slate-500">{selectedPanelIds.length}개 선택됨</span>
                    {selectedPanelIds.length > 0 && (
                      <button onClick={() => setSelectedPanelIds([])} className="text-[11px] text-slate-500 hover:text-red-400 transition-colors">전체 해제</button>
                    )}
                  </div>
                </div>
              )}

              {/* 선택된 차단기 태그 목록 */}
              {selectedPanelIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedPanelIds.map(id => {
                    const info = PANEL_DATA[id];
                    return (
                      <div key={id} className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-950/50 border border-indigo-800/50 rounded-lg">
                        <span className="text-indigo-300 font-mono text-[11px] font-bold">{info?.unitId}</span>
                        <button onClick={() => togglePanel(id)} className="text-slate-500 hover:text-red-400 transition-colors text-[11px] leading-none">✕</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Field>

            {/* 제출 */}
            <button onClick={handleSubmit} disabled={submitting || !isValid}
              className="w-full py-3 rounded-xl bg-[#6B5EF8] hover:bg-[#7B6EFF] disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold text-sm transition-all mt-1 shadow-lg shadow-violet-900/30">
              {submitting ? '등록 중...' : '조작 등록'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusModal({ onClose }: { onClose: () => void }) {
  const [ops, setOps] = React.useState<Operation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState<'전체' | '진행중' | '완료' | '실패'>('전체');

  React.useEffect(() => {
    fetch('/api/operations')
      .then(r => r.json())
      .then(d => { setOps(d.operations ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = tab === '전체' ? ops : ops.filter(o => o.status === tab);

  const TAB_COUNTS = {
    전체: ops.length,
    진행중: ops.filter(o => o.status === '진행중').length,
    완료: ops.filter(o => o.status === '완료').length,
    실패: ops.filter(o => o.status === '실패').length,
  };

  const statusStyle = (s: string) => {
    if (s === '완료') return { dot: 'bg-emerald-400', badge: 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50' };
    if (s === '진행중') return { dot: 'bg-sky-400 animate-pulse', badge: 'bg-sky-900/50 text-sky-300 border-sky-700/50' };
    return { dot: 'bg-red-400', badge: 'bg-red-900/50 text-red-300 border-red-700/50' };
  };
  const typeColor = (t: string) => t === 'KEY CLOSED' ? 'text-slate-400' : t === 'KEY OPEN' ? 'text-emerald-400' : 'text-red-500 font-bold';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0f1623] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-xl mx-4 flex flex-col max-h-[85vh] overflow-hidden">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/70 border-b border-slate-700/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
            </div>
            <div><p className="text-white font-bold text-base">조작 내역</p><p className="text-slate-500 text-[10px] tracking-widest uppercase">STATUS</p></div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-900/60 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* 탭 */}
        <div className="flex gap-1 px-4 py-3 border-b border-slate-800 shrink-0">
          {(['전체', '진행중', '완료', '실패'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === t ? 'bg-[#6B5EF8] text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
              {t}
              <span className={`text-[10px] font-mono px-1 rounded ${tab === t ? 'bg-white/20' : 'bg-slate-700'}`}>{TAB_COUNTS[t]}</span>
            </button>
          ))}
        </div>

        {/* 리스트 */}
        <div className="overflow-y-auto flex-1 min-h-0 p-3 flex flex-col gap-2">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-500 text-sm">로딩 중...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-600">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              <span className="text-sm">내역 없음</span>
            </div>
          ) : filtered.map(op => {
            const st = statusStyle(op.status);
            return (
              <div key={op.id} className="flex items-start gap-3 p-3.5 bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 rounded-xl transition-colors">
                {/* 상태 점 */}
                <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
                  <div className={`w-2.5 h-2.5 rounded-full ${st.dot}`} />
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-indigo-300 font-mono font-bold text-xs">{op.unitId}</span>
                    <span className="text-slate-300 text-xs truncate">{op.panelName}</span>
                    <span className={`text-xs font-bold ${typeColor(op.opType)}`}>[{op.opType}]</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>👤 {op.operator}</span>
                    {op.department && <span>· {op.department}</span>}
                    <span>· {op.purpose}</span>
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono">{op.operatedAt.replace('T', ' ').slice(0, 16)}</div>
                </div>

                {/* 상태 배지 */}
                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.badge}`}>{op.status}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const TEAM_DATA: Record<string, { supervisors: string[]; workers: string[] }> = {
  '전기1팀': { supervisors: ['김철수', '이영민', '박상훈'], workers: ['최동현', '윤지호', '강민석', '조성준'] },
  '전기2팀': { supervisors: ['정수현', '한기범', '오성진'], workers: ['신재호', '임동욱', '류성민', '백준영'] },
  '운전1팀': { supervisors: ['이준호', '김민우', '박재형'], workers: ['송현철', '전성환', '남기훈', '허재원'] },
  '운전2팀': { supervisors: ['최현식', '장영훈', '서민준'], workers: ['고승훈', '윤혁준', '도준서', '문성민'] },
  '정비팀': { supervisors: ['강동원', '노성호', '임준혁'], workers: ['황민준', '권오준', '신성빈', '유재혁'] },
  '안전팀': { supervisors: ['박성민', '김도현', '이재준'], workers: ['조민혁', '한승원', '정우진', '송지훈'] },
};

function StartModal({ onClose }: { onClose: (confirmed?: boolean) => void }) {
  const [team, setTeam] = React.useState('');
  const [supervisor, setSupervisor] = React.useState('');
  const [worker, setWorker] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [regOps, setRegOps] = React.useState<Operation[]>([]);
  const [checkedOpIds, setCheckedOpIds] = React.useState<number[]>([]);
  const toggleOp = (id: number) => setCheckedOpIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const teamInfo = team ? TEAM_DATA[team] : null;
  const confirmed = team && supervisor && worker;

  // 조작등록에서 등록된 차단기 불러오기
  React.useEffect(() => {
    fetch('/api/operations')
      .then(r => r.json())
      .then(d => setRegOps((d.operations ?? []).filter((o: Operation) => o.status === '진행중')))
      .catch(() => { });
  }, []);

  React.useEffect(() => {
    setSupervisor('');
    setWorker('');
  }, [team]);

  const [actionType, setActionType] = React.useState<'start' | 'complete' | null>(null);

  const handleAction = (type: 'start' | 'complete') => {
    setActionType(type);
    setSubmitted(true);
    setTimeout(() => {
      onClose(type === 'start');
      if (type === 'start' && checkedOpIds.length > 0) {
        const panels = checkedOpIds.map(id => {
          const op = regOps.find(o => o.id === id);
          return op ? { id: op.panelId, status: 'ON', description: op.unitId } : null;
        }).filter(Boolean);
        fetch('/api/active-panels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(panels),
        }).catch(() => { });
      }
    }, 1400);
  };

  const selectCls = "w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0f1623] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/70 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
            </div>
            <div><p className="text-white font-bold text-base">조작 시작</p><p className="text-slate-500 text-[10px] tracking-widest uppercase">START</p></div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-900/60 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${actionType === 'complete' ? 'bg-emerald-500/20 border-emerald-500' : 'bg-sky-500/20 border-sky-500'}`}>
              {actionType === 'complete'
                ? <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>}
            </div>
            <p className={`font-bold ${actionType === 'complete' ? 'text-emerald-400' : 'text-sky-400'}`}>
              {actionType === 'complete' ? '작업 완료 처리됨' : '작업 시작됨'}
            </p>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4">

            {/* 조작 내역 — 체크리스트 (최상단) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">조작 내역</label>
                <span className="text-[9px] text-slate-500">{checkedOpIds.length}/{regOps.length} 선택</span>
              </div>
              <div className="bg-slate-800/60 border border-slate-600/60 rounded-xl overflow-hidden max-h-44 overflow-y-auto">
                {regOps.length === 0 ? (
                  <div className="px-4 py-3 text-slate-500 text-xs text-center">등록된 차단기 없음</div>
                ) : regOps.map(op => {
                  const checked = checkedOpIds.includes(op.id);
                  return (
                    <label key={op.id} className={`flex items-center gap-3 px-3 py-2.5 border-b border-slate-700/30 last:border-0 cursor-pointer transition-colors ${checked ? 'bg-indigo-950/40' : 'hover:bg-slate-700/30'}`}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-[#6B5EF8] border-violet-500' : 'bg-slate-700 border-slate-600'}`}>
                        {checked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                      </div>
                      <input type="checkbox" className="hidden" checked={checked} onChange={() => toggleOp(op.id)} />
                      <span className="text-indigo-300 font-mono text-xs font-bold shrink-0">{op.unitId}</span>
                      <span className="text-slate-300 text-xs truncate flex-1">{op.panelName}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 팀 선택 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">팀 선택 <span className="text-red-400">*</span></label>
              <select value={team} onChange={e => setTeam(e.target.value)} className={selectCls}>
                <option value="">— 팀을 선택하세요 —</option>
                {Object.keys(TEAM_DATA).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* 책임자 / 작업자 선택 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">책임자 <span className="text-red-400">*</span></label>
                <select value={supervisor} onChange={e => setSupervisor(e.target.value)} disabled={!team} className={`${selectCls} disabled:opacity-40 disabled:cursor-not-allowed`}>
                  <option value="">— 선택 —</option>
                  {teamInfo?.supervisors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">작업자 <span className="text-red-400">*</span></label>
                <select value={worker} onChange={e => setWorker(e.target.value)} disabled={!team} className={`${selectCls} disabled:opacity-40 disabled:cursor-not-allowed`}>
                  <option value="">— 선택 —</option>
                  {teamInfo?.workers.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>

            {/* 확인 정보 (선택 완료 시 표시) */}
            {confirmed && (
              <div className="flex flex-col gap-0 bg-slate-800/60 border border-slate-600/60 rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-slate-700/40 border-b border-slate-600/40">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">확인 정보</span>
                </div>
                {[
                  { label: '팀', value: team },
                  { label: '책임자', value: supervisor },
                  { label: '작업자', value: worker },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start gap-3 px-4 py-2.5 border-b border-slate-700/40">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider w-16 shrink-0 pt-0.5">{label}</span>
                    <span className="text-sm text-slate-200 leading-snug">{value}</span>
                  </div>
                ))}
                {/* 선택된 조작 목록 */}
                <div className="flex items-start gap-3 px-4 py-2.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider w-16 shrink-0 pt-0.5">조작대상</span>
                  <div className="flex flex-col gap-1 flex-1">
                    {checkedOpIds.length === 0 ? (
                      <span className="text-xs text-slate-500">선택 없음</span>
                    ) : checkedOpIds.map(id => {
                      const op = regOps.find(o => o.id === id);
                      return op ? (
                        <div key={id} className="flex items-center gap-2">
                          <span className="text-indigo-300 font-mono text-xs font-bold">{op.unitId}</span>
                          <span className="text-slate-400 text-xs truncate">{op.panelName}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            )}

            <button onClick={() => handleAction('start')} disabled={!confirmed}
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold text-sm transition-all shadow-lg shadow-sky-900/20 flex items-center justify-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              작업 시작
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CompleteModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [ops, setOps] = React.useState<Operation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [checkedIds, setCheckedIds] = React.useState<number[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [team, setTeam] = React.useState('');
  const [supervisor, setSupervisor] = React.useState('');
  const [worker, setWorker] = React.useState('');
  const teamInfo = team ? TEAM_DATA[team] : null;
  const confirmed = team && supervisor && worker && checkedIds.length > 0;
  React.useEffect(() => { setSupervisor(''); setWorker(''); }, [team]);
  const cSelectCls = "w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors";

  React.useEffect(() => {
    fetch('/api/operations?status=진행중')
      .then(r => r.json())
      .then(d => { setOps(d.operations ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const toggle = (id: number) => setCheckedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setCheckedIds(checkedIds.length === ops.length ? [] : ops.map(o => o.id));

  const handleComplete = async () => {
    if (checkedIds.length === 0) return;
    setSubmitting(true);
    await fetch('/api/operations/complete', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: checkedIds }),
    });
    setDone(true);
    setTimeout(() => { onDone(); onClose(); }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0f1623] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/70 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div><p className="text-white font-bold text-base">조작 완료</p><p className="text-slate-500 text-[10px] tracking-widest uppercase">COMPLETE</p></div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-900/60 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <p className="text-emerald-400 font-bold">{checkedIds.length}건 완료 처리됨</p>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4">
            {/* 리스트 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">진행중 목록</label>
                <button onClick={toggleAll} className="text-[10px] text-sky-400 hover:text-sky-300 font-bold transition-colors">
                  {checkedIds.length === ops.length && ops.length > 0 ? '전체 해제' : '전체 선택'}
                </button>
              </div>
              <div className="bg-slate-800/60 border border-slate-600/60 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="px-4 py-4 text-slate-500 text-xs text-center">로딩 중...</div>
                ) : ops.length === 0 ? (
                  <div className="px-4 py-4 text-slate-500 text-xs text-center">진행중인 작업 없음</div>
                ) : ops.map(op => {
                  const checked = checkedIds.includes(op.id);
                  return (
                    <label key={op.id} className={`flex items-center gap-3 px-3 py-3 border-b border-slate-700/30 last:border-0 cursor-pointer transition-colors ${checked ? 'bg-emerald-950/30' : 'hover:bg-slate-700/30'}`}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-700 border-slate-600'}`}>
                        {checked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                      </div>
                      <input type="checkbox" className="hidden" checked={checked} onChange={() => toggle(op.id)} />
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-300 font-mono text-xs font-bold shrink-0">{op.unitId}</span>
                          <span className="text-slate-300 text-xs truncate">{op.panelName}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-bold ${op.opType === 'KEY CLOSED' ? 'text-slate-400' : op.opType === 'KEY OPEN' ? 'text-emerald-400' : 'text-red-500'}`}>{op.opType}</span>
                          <span className="text-slate-600 text-[9px]">·</span>
                          <span className="text-slate-500 text-[9px]">{op.operator}</span>
                        </div>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse shrink-0" />
                    </label>
                  );
                })}
              </div>
              <div className="text-right text-[10px] text-slate-500">{checkedIds.length}건 선택</div>
            </div>

            {/* 팀 선택 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">팀 선택 <span className="text-red-400">*</span></label>
              <select value={team} onChange={e => setTeam(e.target.value)} className={cSelectCls}>
                <option value="">— 팀을 선택하세요 —</option>
                {Object.keys(TEAM_DATA).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* 책임자 / 작업자 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">책임자 <span className="text-red-400">*</span></label>
                <select value={supervisor} onChange={e => setSupervisor(e.target.value)} disabled={!team} className={`${cSelectCls} disabled:opacity-40 disabled:cursor-not-allowed`}>
                  <option value="">— 선택 —</option>
                  {teamInfo?.supervisors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">작업자 <span className="text-red-400">*</span></label>
                <select value={worker} onChange={e => setWorker(e.target.value)} disabled={!team} className={`${cSelectCls} disabled:opacity-40 disabled:cursor-not-allowed`}>
                  <option value="">— 선택 —</option>
                  {teamInfo?.workers.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>

            {/* 확인 정보 */}
            {confirmed && (
              <div className="flex flex-col gap-0 bg-slate-800/60 border border-emerald-700/30 rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-emerald-900/20 border-b border-emerald-700/30">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">확인 정보</span>
                </div>
                {[
                  { label: '팀', value: team },
                  { label: '책임자', value: supervisor },
                  { label: '작업자', value: worker },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-3 px-4 py-2 border-b border-slate-700/40">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider w-14 shrink-0">{label}</span>
                    <span className="text-sm text-slate-200">{value}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 px-4 py-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider w-14 shrink-0 pt-0.5">대상</span>
                  <div className="flex flex-col gap-0.5 flex-1">
                    {checkedIds.map(id => {
                      const op = ops.find(o => o.id === id);
                      return op ? (
                        <div key={id} className="flex items-center gap-2">
                          <span className="text-indigo-300 font-mono text-xs font-bold">{op.unitId}</span>
                          <span className="text-slate-400 text-xs truncate">{op.panelName}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            )}

            <button onClick={handleComplete} disabled={submitting || !confirmed}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              {submitting ? '처리 중...' : `완료 처리 (${checkedIds.length}건)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function OpDetailModal({ op, onClose }: { op: Operation; onClose: () => void }) {
  const stBadge = op.status === '완료' ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50' : op.status === '진행중' ? 'bg-sky-900/60 text-sky-300 border-sky-700/50' : 'bg-red-900/60 text-red-300 border-red-700/50';
  const typeCls = op.opType === 'KEY CLOSED' ? 'text-slate-300' : op.opType === 'KEY OPEN' ? 'text-emerald-400 font-bold' : 'text-red-500 font-bold';

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700/40">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
    </div>
  );
  const Row = ({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) => (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-800/40 last:border-0">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider w-20 shrink-0">{label}</span>
      <span className={`text-sm ${valueClass ?? 'text-slate-200'}`}>{value || '—'}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0f1623] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/70 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold text-base">조작 상세</span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${stBadge}`}>{op.status}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-900/60 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="flex flex-col">
          {/* 작업정보 */}
          <SectionHeader title="작업정보" />
          <Row label="기기번호" value={op.unitId} valueClass="text-indigo-300 font-mono font-bold" />
          <Row label="기기명" value={op.panelName} />
          <Row label="조작자" value={op.operator} />
          <Row label="부서" value={op.department} />
          <Row label="사유" value={op.purpose} />
          <Row label="일시" value={op.operatedAt.replace('T', ' ').slice(0, 16)} valueClass="text-slate-300 font-mono" />

          {/* 키정보 */}
          <SectionHeader title="키정보" />
          <Row label="키상태" value={op.opType} valueClass={typeCls} />
          <Row label="작업상태" value={op.status} />
          {op.notes && <Row label="비고" value={op.notes} valueClass="text-slate-400" />}
        </div>

        <div className="px-6 pb-5 pt-3">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-bold transition-all">닫기</button>
        </div>
      </div>
    </div>
  );
}

function HistoryModal({ onClose }: { onClose: () => void }) {
  const [ops, setOps] = React.useState<Operation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filterStatus, setFilterStatus] = React.useState('');
  const [filterDate, setFilterDate] = React.useState('');

  React.useEffect(() => {
    const params = new URLSearchParams();
    if (filterStatus) params.set('status', filterStatus);
    if (filterDate) params.set('from', filterDate);
    fetch('/api/operations?' + params.toString())
      .then(r => r.json())
      .then(d => { setOps(d.operations ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filterStatus, filterDate]);

  const statusColor = (s: string) => {
    if (s === '완료') return 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50';
    if (s === '진행중') return 'bg-sky-900/60 text-sky-300 border-sky-700/50';
    return 'bg-red-900/60 text-red-300 border-red-700/50';
  };
  const typeColor = (t: string) => {
    if (t === 'KEY CLOSED') return 'text-slate-400';
    if (t === 'KEY OPEN') return 'text-emerald-400';
    return 'text-red-500 font-bold';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f1623] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden flex flex-col max-h-[85vh]">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-slate-900/60 shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg tracking-tight">이력 조회</h2>
            <p className="text-slate-400 text-xs mt-0.5">HISTORY</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-900/60 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* 필터 */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-800 bg-slate-900/30 shrink-0">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-indigo-500">
            <option value="">전체 상태</option>
            <option value="완료">완료</option>
            <option value="진행중">진행중</option>
            <option value="실패">실패</option>
          </select>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-indigo-500" />
          {(filterStatus || filterDate) && (
            <button onClick={() => { setFilterStatus(''); setFilterDate(''); }} className="text-xs text-slate-500 hover:text-white transition-colors">초기화</button>
          )}
          <span className="ml-auto text-xs text-slate-500">{ops.length}건</span>
        </div>

        {/* 테이블 */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-500 text-sm">로딩 중...</div>
          ) : ops.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-slate-600 text-sm">데이터 없음</div>
          ) : (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-sm">
                <tr className="border-b border-slate-700/60">
                  {['대상기기', '대상기기명', '키상태', '조작자', '일시', '작업상태'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ops.map((op, i) => (
                  <tr key={op.id} className={`border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                    <td className="px-3 py-2.5 text-indigo-300 font-mono font-bold whitespace-nowrap">{op.unitId}</td>
                    <td className="px-3 py-2.5 text-slate-300 max-w-[160px] truncate">{op.panelName}</td>
                    <td className={`px-3 py-2.5 font-bold whitespace-nowrap ${typeColor(op.opType)}`}>{op.opType}</td>
                    <td className="px-3 py-2.5 text-slate-300 whitespace-nowrap">{op.operator}</td>
                    <td className="px-3 py-2.5 text-slate-400 whitespace-nowrap font-mono">{op.operatedAt.replace('T', ' ').slice(0, 16)}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusColor(op.status)}`}>{op.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function FloorPlan({
  cameraPos,
  panels,
  targetSubIds,
  targetPanels,
}: {
  cameraPos: { x: number, z: number, rotation: number },
  panels: any[],
  targetSubIds: number[],
  targetPanels: ActivePanel[],
}) {
  // Use a targeted viewbox designed to fill the screen with just the KOEN wall and the panels
  const width = 2400;
  const height = 3600;

  const NORMAL_SCALE = 132;

  const mapX2D = (z: number) => {
    return 1200 + z * 118;
  };

  const mapY2D = (x: number) => {
    // Top-most wall in 3D is X=35. Map it near 0 to shift the whole layout UPwards
    if (x >= 11) {
      return 10 + (35 - x) * NORMAL_SCALE;
    }
    // For anything below x=11 (where the camera drops back to -14), squash the coordinate slightly
    const yAt11 = 10 + (35 - 11) * NORMAL_SCALE;
    return yAt11 + (11 - x) * 20;
  };

  const openInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="w-full h-full bg-[#0f172a] flex flex-col items-center p-2 pt-3 relative overflow-hidden border-l border-slate-800">
      {/* Header Info */}
      <div className="w-full flex items-center justify-center mb-3 z-30 relative">
        <div className="w-56 mt-4">
          <div className="bg-white rounded-xl w-full overflow-hidden shadow-lg">
            <img src="/logo.png" alt="KOEN" className="w-full h-16 object-cover" />
          </div>
        </div>
      </div>

      <div className="relative group w-full flex-1 flex justify-center items-center overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full bg-[#1e293b]/10 rounded-xl border border-slate-800/30 shadow-inner"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Technical Grid - Subtle */}
          <defs>
            <pattern id="grid-at-glance" width={100} height={100} patternUnits="userSpaceOnUse">
              <path d={`M 100 0 L 0 0 0 100`} fill="none" stroke="rgba(14, 165, 233, 0.15)" strokeWidth="1" />
              <circle cx="50" cy="50" r="1.5" fill="rgba(14, 165, 233, 0.2)" />
            </pattern>
            <radialGradient id="userGlow-at-glance" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="panel-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="selected-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.5" />
            </linearGradient>
            <filter id="glow-eff" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-at-glance)" />

          {/* Environment Walls (Schematic) */}
          {/* Top block removed to maximize space for panels */}

          {/* Panels */}
          {panels.map((p) => {
            const isSelectedUpper = targetSubIds.includes(p.upperId);
            const isSelectedLower = targetSubIds.includes(p.lowerId);
            const isSelected = isSelectedUpper || isSelectedLower;

            // Determine if panel is in the left row (z < 0 in 3D)
            const isLeftRow = p.position[2] < 0;

            // Scaled based on physical dimensions allowing maximum vertical height
            const panelWidth = 480;
            const panelHeight = 250;

            const xPos = mapX2D(p.position[2]) - panelWidth / 2;
            const yPos = mapY2D(p.position[0]) - panelHeight / 2;

            return (
              <g key={p.id}>
                {isSelected && (
                  <rect
                    x={xPos - 12}
                    y={yPos - 12}
                    width={panelWidth + 24}
                    height={panelHeight + 24}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="6"
                    rx="8"
                    filter="url(#glow-eff)"
                    className="animate-pulse"
                  />
                )}
                <rect
                  x={xPos}
                  y={yPos}
                  width={panelWidth}
                  height={panelHeight}
                  fill={isSelected ? "url(#selected-gradient)" : "url(#panel-gradient)"}
                  stroke={isSelected ? "#fca5a5" : "#0ea5e9"}
                  strokeWidth={isSelected ? "4" : "3"}
                  rx="6"
                  className="transition-all duration-300"
                />

                {/* Visual Top Highlight Edge for depth */}
                <rect
                  x={xPos + 2}
                  y={yPos + 2}
                  width={panelWidth - 4}
                  height={panelHeight * 0.15}
                  fill="rgba(255,255,255,0.06)"
                  rx="4"
                  className="pointer-events-none"
                />

                {/* 상단: upperId + unitId + name */}
                <text x={xPos + 18} y={yPos + 54} fontSize="54" fill={isSelectedUpper ? "#fca5a5" : "#facc15"} textAnchor="start" alignmentBaseline="middle" className="font-mono pointer-events-none select-none">
                  {String(p.upperId).padStart(2, '0')}
                </text>
                <text x={xPos + 112} y={yPos + 54} fontSize="52" fill={isSelectedUpper ? "#ffffff" : "#fde68a"} textAnchor="start" alignmentBaseline="middle" className="font-mono pointer-events-none select-none">
                  {PANEL_DATA[p.upperId]?.unitId ?? ''}
                </text>
                <text x={xPos + 18} y={yPos + 106} fontSize="42" fill={isSelectedUpper ? "#fca5a5" : "#7dd3fc"} textAnchor="start" alignmentBaseline="middle" className="pointer-events-none select-none">
                  {(PANEL_DATA[p.upperId]?.name ?? '').slice(0, 28)}
                </text>

                {/* 하단: lowerId + unitId + name */}
                {p.upperId !== p.lowerId && (
                  <>
                    <text x={xPos + 18} y={yPos + 158} fontSize="54" fill={isSelectedLower ? "#fca5a5" : "#facc15"} textAnchor="start" alignmentBaseline="middle" className="font-mono pointer-events-none select-none">
                      {String(p.lowerId).padStart(2, '0')}
                    </text>
                    <text x={xPos + 112} y={yPos + 158} fontSize="52" fill={isSelectedLower ? "#ffffff" : "#fde68a"} textAnchor="start" alignmentBaseline="middle" className="font-mono pointer-events-none select-none">
                      {PANEL_DATA[p.lowerId]?.unitId ?? ''}
                    </text>
                    <text x={xPos + 18} y={yPos + 210} fontSize="42" fill={isSelectedLower ? "#fca5a5" : "#7dd3fc"} textAnchor="start" alignmentBaseline="middle" className="pointer-events-none select-none">
                      {(PANEL_DATA[p.lowerId]?.name ?? '').slice(0, 28)}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Camera Indicator (User Position) - Enhanced Red Dot */}
          <g transform={`translate(${mapX2D(0)}, ${mapY2D(cameraPos.x)})`}>
            {/* The glow is larger to fit the massive scale */}
            <circle r="160" fill="url(#userGlow-at-glance)" />
            {/* Main Red Dot (Only position, no gaze) */}
            <circle r="36" fill="#ef4444" stroke="#fff" strokeWidth="8" className="animate-pulse shadow-lg" />
            <circle r="14" fill="#fff" opacity="0.9" />
          </g>
        </svg>
      </div>

    </div>
  );
}

const StaticEnvironment = React.memo(function StaticEnvironment({
  floorModel, ceilingModel, floorScale, ceilingScale, floorPos, ceilingPos
}: any) {
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight
        position={[10, 15, 0]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[10, 5.8, 0]} intensity={1.5} color="#e2e8f0" />
      <pointLight position={[30, 5.8, 0]} intensity={1.5} color="#e2e8f0" />
      <spotLight position={[0, 8, 0]} angle={0.6} penumbra={1} intensity={3} castShadow />

      {/* Overhead industrial lights - multiple segments for realism */}
      <rectAreaLight width={20} height={1} position={[10, 5.8, 0]} rotation={[-Math.PI / 2, 0, 0]} intensity={6} color="#f8fafc" />
      <rectAreaLight width={20} height={1} position={[30, 5.8, 0]} rotation={[-Math.PI / 2, 0, 0]} intensity={6} color="#f8fafc" />

      <Environment files="/textures/empty_warehouse_01_1k.hdr" background blur={0.8} />

      <ContactShadows position={[0, 0.01, 0]} opacity={0.7} scale={80} blur={2.5} far={10} resolution={1024} color="#000000" />

      <EffectComposer>
        <Bloom luminanceThreshold={1.2} mipmapBlur intensity={0.8} radius={0.3} />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>

      {/* GLB Floor - Autofitted to room limits */}
      <primitive 
        object={floorModel} 
        scale={floorScale} 
        position={floorPos} 
        receiveShadow 
      />

      {/* Enclosed Room Walls - Dark industrial look */}
      {/* Wall behind Row 1 */}
      <mesh position={[10, 3, -5.2]} receiveShadow>
        <planeGeometry args={[50, 6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Wall behind Row 2 */}
      <mesh position={[10, 3, 5.2]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[50, 6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Front and Back Walls */}
      {/* Back Wall (Entry) */}
      <mesh position={[-15, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[10.4, 6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Front Wall (Facing the aisle) */}
      <mesh position={[35, 3, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[10.4, 6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.1} />

        {/* Massive Corporate Sign Board - Filling the wall */}
        <group position={[0, 0.5, 0.05]}>
          {/* Main Backing plate - Dark Tech */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[10.0, 4.0, 0.2]} />
            <meshStandardMaterial color="#020617" roughness={0.7} metalness={0.8} />
          </mesh>

          {/* Inner Accent Plate (Glowing edge) */}
          <mesh position={[0, 0, 0.1]}>
            <planeGeometry args={[9.8, 3.8]} />
            <meshStandardMaterial color="#0f172a" emissive="#0ea5e9" emissiveIntensity={0.3} roughness={0.1} metalness={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.101]}>
            <planeGeometry args={[9.6, 3.6]} />
            <meshStandardMaterial color="#020617" roughness={0.4} metalness={0.5} />
          </mesh>

          {/* Giant KOEN Text (Fancy glowing material) */}
          <Text
            position={[0, 0.4, 0.15]}
            fontSize={2.5}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.15}
            fontStyle="italic"
            fontWeight="bold"
          >
            KOEN
            <meshStandardMaterial color="#ffffff" emissive="#38bdf8" emissiveIntensity={1.5} roughness={0.2} metalness={0.8} />
          </Text>

          {/* Subtitle Text in Korean */}
          <Text
            position={[0, -1.1, 0.15]}
            fontSize={0.7}
            color="#475569"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.2}
            font="/fonts/Pretendard-Bold.woff"
          >
            한국남동발전
            <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.6} />
          </Text>
        </group>
      </mesh>

      {/* GLB Ceiling - Autofitted to room limits */}
      <primitive 
        object={ceilingModel} 
        scale={ceilingScale} 
        position={ceilingPos} 
        receiveShadow 
      />

      {/* Emissive Light Panels representing rectangular drop-ceiling lights */}
      {[-5.1, 0.3, 5.7, 10.5, 15.3, 20.1, 24.9, 30.3].map(x => (
        <React.Fragment key={`light-${x}`}>
          {/* Main center aisle panels aligned with 0.6 cells */}
          <mesh position={[x, 5.95, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.2, 0.6]} />
            <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[x, 5.95, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.2, 0.6]} />
            <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.8} />
          </mesh>
        </React.Fragment>
      ))}

      {/* Room Labels */}
      <Text
        position={[0, 6.5, -14.9]}
        fontSize={1.2}
        color="#64748b"
        anchorX="center"
      >
        MAIN ELECTRICAL ROOM
      </Text>
    </>
  );
});

function Scene({ targetSubIds, clearActivePanels, onCameraUpdate, panels, isOperationActive }: { targetSubIds: number[], clearActivePanels: () => void, onCameraUpdate: (pos: { x: number, z: number, rotation: number }) => void, panels: any[], isOperationActive: boolean }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const { scene: floorModel } = useGLTF(`/floor.glb?v=${GLB_VERSION}`);
  const { scene: ceilingModel } = useGLTF(`/ceiling.glb?v=${GLB_VERSION}`);

  // Floor/Ceiling Auto-Fit logic: 전체 룸 크기(-15 ~ 35, -5.2 ~ 5.2)에 딱 맞게 스케일 및 위치 조정
  const { floorScale, ceilingScale, floorPos, ceilingPos } = useMemo(() => {
    const fBox = new THREE.Box3().setFromObject(floorModel);
    const fSize = fBox.getSize(new THREE.Vector3());
    const cBox = new THREE.Box3().setFromObject(ceilingModel);
    const cSize = cBox.getSize(new THREE.Vector3());

    const targetWidth = 50;  // X축: -15 to 35
    const targetDepth = 10.4; // Z축: -5.2 to 5.2

    // 스케일 계산
    const fScale = [targetWidth / fSize.x, 1, targetDepth / fSize.z] as [number, number, number];
    const cScale = [targetWidth / cSize.x, 1, targetDepth / cSize.z] as [number, number, number];

    // 위치 계산: 모델의 중심을 룸의 중심(X=10, Z=0)에 배치
    const fCenter = fBox.getCenter(new THREE.Vector3());
    const cCenter = cBox.getCenter(new THREE.Vector3());

    const fPos = [
      10 - fCenter.x * fScale[0],
      -fBox.min.y,
      0 - fCenter.z * fScale[2]
    ] as [number, number, number];

    const cPos = [
      10 - cCenter.x * cScale[0],
      6 - cBox.min.y, // 천장 높이 6 기준
      0 - cCenter.z * cScale[2]
    ] as [number, number, number];

    return { floorScale: fScale, ceilingScale: cScale, floorPos: fPos, ceilingPos: cPos };
  }, [floorModel, ceilingModel]);

  const colWidth = 2.0;
  const floorHeight = 2.5;
  const START_X = 10;
  const ROW_Z: [number, number] = [-4.9, 4.9];

  const [selectedPos, setSelectedPos] = useState<[number, number, number] | null>(null);
  const [moving, setMoving] = useState(false);
  const [pathArrows, setPathArrows] = useState<{ position: [number, number, number], target: [number, number, number] }[]>([]);
  const [blinkingIds, setBlinkingIds] = useState<number[]>([]);
  const lastUpdatePos = useRef(new THREE.Vector3());
  const lastUpdateRot = useRef(0);

  const sequenceRunning = useRef(false);

  const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

  // 화살표 경로 계산 (순수 함수)
  const computeArrows = (startPos: THREE.Vector3, pos: [number, number, number]) => {
    const aisleZ = 0;
    const visualPts = [
      startPos.clone().setY(0),
      new THREE.Vector3(startPos.x, 0, aisleZ),
      new THREE.Vector3(pos[0], 0, aisleZ),
      new THREE.Vector3(pos[0], 0, pos[2]),
    ];
    const clean = (pts: THREE.Vector3[]) => {
      const r = [pts[0]];
      for (let i = 1; i < pts.length; i++)
        if (pts[i].distanceTo(r[r.length - 1]) > 0.2) r.push(pts[i]);
      if (r.length === 1) r.push(pts[pts.length - 1]);
      return r;
    };
    const curve = new THREE.CatmullRomCurve3(clean(visualPts), false, 'catmullrom', 0.1);
    const n = Math.max(3, Math.floor(curve.getLength() / 0.7));
    return Array.from({ length: n }, (_, idx) => {
      const t = (idx + 1) / (n + 1);
      const pt = curve.getPoint(t);
      const ahead = curve.getPoint(Math.min(1, t + 0.05));
      let tgt: [number, number, number] = [ahead.x, 0.02, ahead.z];
      if (idx === n - 1) tgt = [pos[0], 0.02, pos[2]];
      if (new THREE.Vector3(...tgt).distanceTo(pt) < 0.01) {
        const tan = curve.getTangent(t);
        tgt = [pt.x + tan.x * 0.1, 0.02, pt.z + tan.z * 0.1];
      }
      return { position: [pt.x, 0.02, pt.z] as [number, number, number], target: tgt };
    });
  };

  // 패널까지 이동 (Promise 반환)
  const walkToPanel = (exactPos: { x: number, y: number, z: number, camZ: number }): Promise<void> =>
    new Promise(resolve => {
      if (!controlsRef.current) { resolve(); return; }
      setMoving(true);
      const tl = gsap.timeline({ onComplete: () => setTimeout(resolve, 2000) });
      // camera와 target을 동일한 ease·duration으로 동시 이동 (순간이동 없음)
      tl.to(camera.position, {
        duration: 4.5, ease: 'power2.inOut',
        x: exactPos.x, y: exactPos.y, z: exactPos.camZ,
        onUpdate: () => controlsRef.current?.update(),
      }, 0);
      tl.to(controlsRef.current.target, {
        duration: 4.5, ease: 'power2.inOut',
        x: exactPos.x, y: exactPos.y, z: exactPos.z,
        onUpdate: () => controlsRef.current?.update(),
      }, 0);
    });

  // 홈으로 복귀 (Promise 반환)
  const goHome = (): Promise<void> =>
    new Promise(resolve => {
      if (!controlsRef.current) { setMoving(false); resolve(); return; }
      setMoving(true);
      const tl = gsap.timeline({ onComplete: () => { setMoving(false); resolve(); } });
      tl.to(camera.position, {
        duration: 3.5, ease: 'power2.inOut',
        x: -6, y: 4.0, z: 0,
        onUpdate: () => controlsRef.current?.update(),
      }, 0);
      tl.to(controlsRef.current.target, {
        duration: 3.5, ease: 'power2.inOut',
        x: 40, y: 2.8, z: 0,
        onUpdate: () => controlsRef.current?.update(),
      }, 0);
    });

  // Keyboard state for navigation
  const keys = useRef<{ [key: string]: boolean }>({});
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Monitor OrbitControls for manual interaction
  useEffect(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      const handleChange = () => { /* Inactivity timer removed */ };
      controls.addEventListener('change', handleChange);
      return () => controls.removeEventListener('change', handleChange);
    }
  }, [controlsRef.current]);

  useFrame((state, delta) => {
    const px = Math.round(state.camera.position.x * 100) / 100;
    const pz = Math.round(state.camera.position.z * 100) / 100;
    const rot = Math.round(state.camera.rotation.y * 1000) / 1000;
    if (px !== lastUpdatePos.current.x || pz !== lastUpdatePos.current.z || rot !== lastUpdateRot.current) {
      // 3D X → 2D 좌표계 변환 (고정 2.0 스케일)
      const scaledX = px >= START_X && colWidth > 0
        ? START_X + (px - START_X) * (2.0 / colWidth)
        : px;
      onCameraUpdate({ x: Math.round(scaledX * 100) / 100, z: pz, rotation: rot });
      lastUpdatePos.current.set(px, state.camera.position.y, pz);
      lastUpdateRot.current = rot;
    }

    if (moving || sequenceRunning.current || !isOperationActive) return;

    const speed = 0.75 * delta; // Half of human walking speed (~0.75 m/s)
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3();
    const sideVector = new THREE.Vector3();

    // Get forward direction (ignore Y for walking)
    camera.getWorldDirection(frontVector);
    frontVector.y = 0;
    frontVector.normalize();

    // Get side direction
    sideVector.copy(frontVector).cross(camera.up).normalize();

    if (keys.current['ArrowUp'] || keys.current['w'] || keys.current['W']) direction.add(frontVector);
    if (keys.current['ArrowDown'] || keys.current['s'] || keys.current['S']) direction.add(frontVector.clone().negate());
    if (keys.current['ArrowLeft'] || keys.current['a'] || keys.current['A']) direction.add(sideVector.clone().negate());
    if (keys.current['ArrowRight'] || keys.current['d'] || keys.current['D']) direction.add(sideVector);

    if (direction.length() > 0) {
      if (pathArrows.length > 0) setPathArrows([]);
      direction.normalize().multiplyScalar(speed);

      // Basic collision detection (don't walk through panels)
      const nextPos = camera.position.clone().add(direction);
      const isInsidePanelRow1 = nextPos.z > -4.4 && nextPos.z < -3.6 && nextPos.x > -10 && nextPos.x < 10;
      const isInsidePanelRow2 = nextPos.z > 3.6 && nextPos.z < 4.4 && nextPos.x > -10 && nextPos.x < 10;
      const isOutsideRoom = nextPos.x < -24 || nextPos.x > 35 || Math.abs(nextPos.z) > 4.2;

      if (!isInsidePanelRow1 && !isInsidePanelRow2 && !isOutsideRoom) {
        camera.position.add(direction);
        if (controlsRef.current) {
          controlsRef.current.target.add(direction);
          controlsRef.current.update();
        }
      }
    }
  });

  // 메인 시퀀스: 2사이클 (패널깜박 → 경로깜박 → 이동 → 복귀)
  useEffect(() => {
    if (targetSubIds.length === 0) return;

    // 여러 개일 때는 깜박이기만 하고 5초 후 초기화
    if (targetSubIds.length > 1) {
      setBlinkingIds(targetSubIds);
      const t = setTimeout(() => {
        setBlinkingIds([]);
        clearActivePanels();
      }, 5000);
      return () => clearTimeout(t);
    }

    const panel = panels.find((p: any) => p.upperId === targetSubIds[0] || p.lowerId === targetSubIds[0]);
    if (!panel) return;

    let cancelled = false;
    sequenceRunning.current = true;

    const run = async () => {
      setBlinkingIds(targetSubIds);

      // Calculate the closest panel from the current camera position
      let closestPanelId = targetSubIds[0];
      let minDistance = Infinity;

      const START_X = 11;
      const ROW_Z: [number, number] = [-4.9, 4.9];

      for (const pid of targetSubIds) {
        let pRow, pCol;
        if (pid <= 24) {
          pRow = 1;
          pCol = Math.floor((pid - 1) / 2);
        } else if (pid === 47) {
          pRow = 0;
          pCol = 0;
        } else {
          pRow = 0;
          const startId = pid % 2 === 1 ? pid : pid - 1;
          pCol = (47 - startId) / 2;
        }

        const pExactX = START_X + pCol * colWidth;
        const pExactZ = ROW_Z[pRow];

        const dist = Math.hypot(camera.position.x - pExactX, camera.position.z - pExactZ);
        if (dist < minDistance) {
          minDistance = dist;
          closestPanelId = pid;
        }
      }

      const panelId = closestPanelId;
      let row, col, floor;
      if (panelId <= 24) {
        row = 1;
        col = Math.floor((panelId - 1) / 2);
        floor = panelId % 2 === 1 ? 1 : 0;
      } else if (panelId === 47) {
        row = 0;
        col = 0;
        floor = 1; // Treat as upper for height calculation
      } else {
        row = 0;
        const startId = panelId % 2 === 1 ? panelId : panelId - 1;
        col = (47 - startId) / 2;
        floor = panelId % 2 === 1 ? 1 : 0;
      }

      const exactX = START_X + col * colWidth;
      const exactY = floor * floorHeight + (panelId === 47 ? floorHeight : (floorHeight / 2));
      const exactZ = ROW_Z[row];

      const distance = 8.0;
      const camZ = row === 0 ? exactZ + distance : exactZ - distance;

      for (let cycle = 0; cycle < 2; cycle++) {
        if (cancelled) break;

        // ① Wait for initial visual cue (blinking already started)
        await wait(1000);
        if (cancelled) break;

        // ② 바닥 경로 3회 깜박
        const arrows = computeArrows(camera.position.clone(), [exactX, 0, ROW_Z[row]]);
        for (let i = 0; i < 3; i++) {
          if (cancelled) break;
          setPathArrows(arrows);
          await wait(350);
          setPathArrows([]);
          await wait(250);
        }
        if (cancelled) break;
        setPathArrows(arrows); // 깜박 후 유지
        await wait(300);

        // ③ 패널까지 이동
        await walkToPanel({ x: exactX, y: exactY, z: exactZ, camZ });
        if (cancelled) break;

        // ④ 홈 복귀
        setPathArrows([]);
        await goHome();
        if (cancelled) break;
      }

      // 2회 왕복 완료 → 5초 유지 후 초기화
      if (!cancelled) {
        await wait(5000);
        if (!cancelled) {
          setBlinkingIds([]);
          await clearActivePanels(); // 서버 DELETE 완료 후 setTargetPanels([])
          sequenceRunning.current = false;
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      sequenceRunning.current = false;
      setMoving(false);
      setBlinkingIds([]);
      setPathArrows([]);
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(camera);
      if (controlsRef.current) {
        gsap.killTweensOf(controlsRef.current.target);
        controlsRef.current.update();
      }
    };
  }, [targetSubIds.join(',')]);

  return (
    <>
      <color attach="background" args={['#0a0a0a']} />

      {/* Start at the front of the aisle looking straight down */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={[40, 2.8, 0]}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        enablePan={false}
        enableRotate={false}
        enableZoom={isOperationActive}
      />

      {/* Visual Path - Animated Arrows on the floor */}
      {pathArrows.map((arrow, idx) => (
        <PathArrow
          key={idx}
          index={idx}
          position={arrow.position}
          target={arrow.target}
        />
      ))}

      <Suspense fallback={null}>
        <GLBGrid blinkingIds={blinkingIds} />
      </Suspense>

      <StaticEnvironment
        floorModel={floorModel}
        ceilingModel={ceilingModel}
        floorScale={floorScale}
        ceilingScale={ceilingScale}
        floorPos={floorPos}
        ceilingPos={ceilingPos}
      />

      {/* Instructions */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
        <Text
          position={[0, 4.5, -8]}
          fontSize={0.6}
          color="#10b981"
          maxWidth={10}
          textAlign="center"
        >
          ELECTRICAL PANEL MONITORING
        </Text>
        <Text
          position={[0, 3.8, -8]}
          fontSize={0.2}
          color="#475569"
          fillOpacity={0.8}
        >
          {moving ? "Walking to panel..." : "Use Arrow Keys to walk • Click panel to inspect • Click open door to close"}
        </Text>
      </Float>
    </>
  );
}

const SIDE_BUTTONS = [
  { label: '조작 등록', sub: 'REGISTER', action: 'registration' },
  { label: '조작등록내역', sub: 'STATUS', action: 'status' },
  { label: '조작 시작', sub: 'START', action: 'start' },
  { label: '조작 완료', sub: 'COMPLETE', action: 'complete' },
  { label: '이력 조회', sub: 'HISTORY', action: 'history' },
];

export default function App() {
  const [activeKeys, setActiveKeys] = useState<{ [key: string]: boolean }>({});
  const [activeSideBtn, setActiveSideBtn] = useState<string>('조작 등록');
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const [targetPanels, setTargetPanels] = useState<ActivePanel[]>([]);
  const [cameraPos, setCameraPos] = useState({ x: -6, z: 0, rotation: 0 });
  const [showRegistration, setShowRegistration] = React.useState(false);
  const [showStart, setShowStart] = React.useState(false);
  const [isOperationActive, setIsOperationActive] = React.useState(false);
  const [showComplete, setShowComplete] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);
  const [statusOps, setStatusOps] = React.useState<Operation[]>([]);
  const [statusLoading, setStatusLoading] = React.useState(true);
  const [selectedOp, setSelectedOp] = React.useState<Operation | null>(null);

  // 조작 내역 자동 로드
  React.useEffect(() => {
    fetch('/api/operations?status=진행중').then(r => r.json())
      .then(d => { setStatusOps(d.operations ?? []); setStatusLoading(false); })
      .catch(() => setStatusLoading(false));
  }, []);

  const targetSubIds = useMemo(() => targetPanels.map(p => p.id), [targetPanels]);
  const lastFetchedRef = useRef<string>('[]');

  // Polling for active panels from local API
  useEffect(() => {
    const pollActivePanels = async () => {
      try {
        const response = await fetch('/api/active-panels');
        const data = await response.json();
        if (data.panels && Array.isArray(data.panels)) {
          const serialized = JSON.stringify(data.panels);
          if (serialized !== lastFetchedRef.current) {
            lastFetchedRef.current = serialized;
            setTargetPanels(data.panels);
          }
        }
      } catch (err) {
        // Silently fail if server not ready or offline
      }
    };

    const interval = setInterval(pollActivePanels, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2 rows of 12 cabinets (Total 24 cabinets)
  const panels = useMemo(() => {
    const items = [];
    const rowZ = [-4.9, 4.9];
    const startX = 11;

    // Right Side (Row 1): Entry(1,2) -> KOEN(23,24)
    for (let col = 0; col < 12; col++) {
      const upperId = col * 2 + 1;
      const lowerId = col * 2 + 2;
      items.push({
        id: `r1-c${col}`,
        upperId,
        lowerId,
        position: [startX + col * 2.0, 2.5, rowZ[1]] as [number, number, number],
        rotation: [0, Math.PI, 0] as [number, number, number]
      });
    }

    // Left Side (Row 0): Entry(47) -> KOEN(25,26)
    for (let col = 0; col < 12; col++) {
      if (col === 0) {
        items.push({
          id: `r0-c0`,
          upperId: 47,
          lowerId: 47, // merged
          position: [startX + col * 2.0, 2.5, rowZ[0]] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number]
        });
        continue;
      }
      const upperId = 47 - (col * 2);
      const lowerId = upperId + 1;
      items.push({
        id: `r0-c${col}`,
        upperId,
        lowerId,
        position: [startX + col * 2.0, 2.5, rowZ[0]] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number]
      });
    }
    return items;
  }, []);

  const clearTargetPanels = useCallback(async () => {
    // 서버 먼저 비운 뒤 로컬 초기화 → 폴링 재트리거 방지
    try {
      await fetch('/api/active-panels', { method: 'DELETE' });
    } catch (err) { }
    lastFetchedRef.current = '[]';
    setTargetPanels([]);
  }, []);

  // Sync activeKeys with window events for the Scene to consume via a custom event or shared ref
  // But since Scene uses a ref for performance, we'll just update the ref from the UI buttons
  const triggerKey = (key: string, pressed: boolean) => {
    const event = new KeyboardEvent(pressed ? 'keydown' : 'keyup', { key });
    window.dispatchEvent(event);
    setActiveKeys(prev => ({ ...prev, [key]: pressed }));
  };

  return (
    <div className="w-full h-screen bg-slate-950 overflow-hidden relative font-sans select-none flex flex-col md:flex-row">
      {showRegistration && <RegistrationModal onClose={() => { setShowRegistration(false); fetch('/api/operations?status=진행중').then(r => r.json()).then(d => setStatusOps(d.operations ?? [])); }} />}
      {showStart && <StartModal onClose={(confirmed) => { setShowStart(false); if (confirmed) setIsOperationActive(true); }} />}
      {showComplete && <CompleteModal onClose={() => setShowComplete(false)} onDone={() => { fetch('/api/operations?status=진행중').then(r => r.json()).then(d => setStatusOps(d.operations ?? [])); }} />}
      {showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}
      {selectedOp && <OpDetailModal op={selectedOp} onClose={() => setSelectedOp(null)} />}
      {/* Left Side: 2D Floor Plan */}
      <div className="w-full md:w-[30%] h-[40%] md:h-full border-b md:border-b-0 md:border-r border-slate-800 z-30">
        <FloorPlan
          cameraPos={cameraPos}
          panels={panels}
          targetSubIds={targetSubIds}
          targetPanels={targetPanels}
        />
      </div>

      {/* Right Side: 3D Scene + Button Sidebar */}
      <div className="w-full md:w-[70%] h-[60%] md:h-full flex flex-row pr-6">

        {/* 3D Canvas 영역 — 프레임 */}
        <div className="relative flex-1 h-full bg-[#080c14] flex flex-col p-2.5 gap-2">

          {/* 상단 헤더 바 */}
          <div className="relative flex items-center justify-between px-5 py-0 shrink-0 overflow-hidden rounded-xl"
            style={{ background: 'linear-gradient(90deg, #020d1f 0%, #0a1e3a 30%, #061429 60%, #020d1f 100%)', borderTop: '1px solid rgba(56,189,248,0.25)', borderBottom: '1px solid rgba(56,189,248,0.12)', boxShadow: '0 0 40px rgba(14,165,233,0.12), inset 0 1px 0 rgba(56,189,248,0.08)' }}>


            {/* 왼쪽: 로고 + 타이틀 */}
            <div className="flex items-center gap-4 py-2.5 z-10">
              {/* 수직 액센트 바 */}
              <div className="flex flex-col gap-[3px]">
                <div className="w-[3px] h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #38bdf8, #0ea5e9)' }} />
                <div className="w-[3px] h-2 rounded-full bg-sky-700" />
                <div className="w-[3px] h-1 rounded-full bg-sky-900" />
              </div>
              <div className="flex flex-col gap-[2px]">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-bold tracking-[0.4em] uppercase" style={{ color: '#38bdf8', opacity: 0.7 }}>YEONGDONG POWER PLANT · UNIT 1</span>
                  <div className="h-px w-8 bg-gradient-to-r from-sky-500/50 to-transparent" />
                </div>
                <span className="text-[15px] font-bold tracking-[0.04em] text-white" style={{ textShadow: '0 0 20px rgba(56,189,248,0.3)' }}>
                  영동 1호기 고압차단기 위치안내시스템
                </span>
              </div>
            </div>

            {/* 오른쪽: 상태정보 + 시간 */}
            <div className="flex items-center gap-2 z-10">
              {/* 시스템 */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                <span className="text-[9px] font-bold text-emerald-400">정상가동</span>
              </div>
              {/* 알람 */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <div className={`w-1.5 h-1.5 rounded-full ${targetPanels.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-[9px] font-bold text-slate-500">알람</span>
                {targetPanels.length > 0
                  ? <span className="text-[9px] font-bold text-red-400">{targetPanels.length}건</span>
                  : <span className="text-[9px] font-bold text-emerald-400">없음</span>}
              </div>
              {/* 패널 */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <span className="text-[9px] font-bold text-slate-500">패널</span>
                <span className="text-[9px] font-bold text-sky-400">47</span>
              </div>
              {/* 월간이력 */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <span className="text-[9px] font-bold text-slate-500">월간</span>
                <span className="text-[9px] font-bold text-violet-400">{statusOps.filter(o => { const d = new Date(o.operatedAt); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(); }).length}건</span>
              </div>
              {/* 구분선 */}
              <div className="w-px h-5 bg-sky-900/60" />
              {/* 날짜 + 시간 */}
              <span className="text-[12px] font-mono font-bold text-sky-300" style={{ textShadow: '0 0 10px rgba(56,189,248,0.4)' }}>
                {now.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '')}
                &nbsp;
                {now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </span>
            </div>

            {/* 오른쪽 끝 글로우 */}
            <div className="absolute right-0 top-0 bottom-0 w-32 pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.04))' }} />
          </div>

          {/* 캔버스 프레임 */}
          <div className="relative flex-1 rounded-xl overflow-hidden border-2 border-sky-500/50 shadow-[0_0_0_1px_rgba(14,165,233,0.15),0_0_60px_rgba(14,165,233,0.18),inset_0_0_30px_rgba(14,165,233,0.04)] min-h-0">


            {/* 알람 배너 */}
            {targetPanels.length > 0 && (
              <div className="absolute top-3 left-3 right-1/2 z-30 flex flex-col gap-0.5 pointer-events-none">
                {targetPanels.map(p => {
                  const info = PANEL_DATA[p.id];
                  return (
                    <div key={p.id} className="flex items-center gap-2 bg-red-950/90 backdrop-blur-sm border border-red-800/60 px-2.5 py-1 rounded-md shadow-lg">
                      <span className="relative flex h-1.5 w-1.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                      </span>
                      <span className="text-red-300 font-mono font-bold text-[11px] tracking-wide shrink-0">{info?.unitId ?? String(p.id).padStart(2, '0')}</span>
                      <span className="w-px h-3 bg-red-800 shrink-0" />
                      <span className="text-slate-200 text-[11px] truncate flex-1">{info?.name ?? p.description}</span>
                      {p.status && (
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${p.status.toUpperCase() === 'ON' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-900 text-red-300'}`}>
                          {p.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <Canvas
              shadows
              dpr={[1, 2]}
              className="w-full h-full"
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                background: '#0a0a0a'
              }}
              camera={{ position: [-6, 4.0, 0], fov: 30, near: 0.1, far: 1000 }}
            >
              <Suspense fallback={
                <Html center>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: 10, height: 10, borderRadius: '50%', background: '#10b981',
                          animation: 'bounce 1s ease-in-out infinite',
                          animationDelay: `${i * 0.15}s`
                        }} />
                      ))}
                    </div>
                    <p style={{ color: '#10b981', fontFamily: 'monospace', fontWeight: 'bold', fontSize: 13, letterSpacing: 3, textTransform: 'uppercase' }}>
                      패널 로딩 중...
                    </p>
                  </div>
                </Html>
              }>
                <Scene targetSubIds={targetSubIds} clearActivePanels={clearTargetPanels} onCameraUpdate={setCameraPos} panels={panels} isOperationActive={isOperationActive} />
              </Suspense>
            </Canvas>
          </div>{/* 캔버스 프레임 닫기 */}

          {/* 하단 바 */}
          <div className="shrink-0 flex items-center justify-end px-4 py-1.5 rounded-xl border border-sky-900/40 bg-slate-900/60">
            <span className="text-[10px] font-bold tracking-[0.12em] text-slate-500">영동 1호기 고압차단기</span>
          </div>

        </div>{/* 3D 프레임 래퍼 닫기 */}

        {/* 버튼 사이드바 */}
        <div className="w-72 h-full flex flex-col bg-[#111827] border-l border-slate-800/80 shrink-0 overflow-hidden">

          {/* 통신정보 섹션 */}
          <div className="px-3 pt-3 pb-2 shrink-0">
            <div className="rounded-xl bg-slate-900/70 border border-slate-700/60 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-700/50 bg-slate-800/40">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" /></svg>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">통신정보</span>
              </div>
              <div className="flex flex-col divide-y divide-slate-700/40">
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="relative shrink-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50" />
                  </div>
                  <span className="text-[11px] text-slate-300 font-medium">GENi 연동</span>
                  <span className="ml-auto text-[9px] font-bold text-emerald-400">ON</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="relative shrink-0">
                    <div className="w-2 h-2 rounded-full bg-sky-400" />
                    <div className="absolute inset-0 rounded-full bg-sky-400 animate-ping opacity-50" />
                  </div>
                  <span className="text-[11px] text-slate-300 font-medium">키보관함 연동</span>
                  <span className="ml-auto text-[9px] font-bold text-sky-400">ON</span>
                </div>
              </div>
            </div>
          </div>


          {/* 상단 버튼: 조작 등록 + 조작등록내역 */}
          <div className="flex flex-col gap-2 pl-3 pr-6 pb-2 shrink-0">
            {SIDE_BUTTONS.filter(b => b.action === 'registration' || b.action === 'status').map(({ label, sub, action }) => {
              const isActive = activeSideBtn === label;
              return (
                <button key={label}
                  onClick={() => { setActiveSideBtn(label); if (action === 'registration') setShowRegistration(true); }}
                  className={`w-full rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 ${isActive
                    ? 'bg-[#6B5EF8] hover:bg-[#7B6EFF] shadow-md shadow-violet-900/40 py-4'
                    : action === 'status'
                      ? 'bg-[#1e2a3e] hover:bg-[#253348] border-2 border-sky-500/70 hover:border-sky-400 py-3.5'
                      : 'bg-[#1e2a3e] hover:bg-[#253348] border border-slate-700/50 hover:border-slate-600 py-3.5'
                    }`}
                >
                  <span className={`text-[13px] font-bold tracking-tight leading-none ${isActive ? 'text-white' : 'text-slate-200'}`}>{label}</span>
                  <span className={`text-[9px] font-semibold tracking-[0.2em] uppercase leading-none ${isActive ? 'text-violet-200' : 'text-slate-500'}`}>{sub}</span>
                </button>
              );
            })}
          </div>

          {/* 조작 내역 리스트 */}
          <div className="mx-3 flex flex-col rounded-xl border-2 border-sky-500/60 shadow-md shadow-sky-900/20 mb-2 shrink-0" style={{ maxHeight: '196px', overflow: 'hidden' }}>
            {/* 섹션 헤더 */}
            <div className="flex items-center justify-between px-3 py-2 bg-sky-900/30 border-b border-sky-700/40 shrink-0">
              <div className="flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">조작 등록 내역</span>
              </div>
              <span className="text-[9px] font-mono text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded-full">{statusOps.length}건</span>
            </div>

            {/* 컬럼 헤더 */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border-b border-slate-700/40 shrink-0">
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider w-16 shrink-0">기기번호</span>
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider flex-1">키상태</span>
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider w-12 shrink-0 text-center">작업상태</span>
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider w-10 shrink-0 text-center">상세</span>
            </div>

            {/* 스크롤 목록 */}
            <div className="overflow-y-auto flex-1 min-h-0 divide-y divide-slate-700/30">
              {statusLoading ? (
                <div className="text-center text-slate-600 text-xs py-8">로딩 중...</div>
              ) : statusOps.length === 0 ? (
                <div className="text-center text-slate-600 text-xs py-8">내역 없음</div>
              ) : [...statusOps].sort((a, b) => b.operatedAt.localeCompare(a.operatedAt)).map((op, i) => {
                const stBadge = op.status === '완료'
                  ? 'bg-emerald-900/60 text-emerald-300'
                  : op.status === '진행중'
                    ? 'bg-sky-900/60 text-sky-300'
                    : 'bg-red-900/60 text-red-300';
                const typeCls = op.opType === 'KEY CLOSED' ? 'text-slate-400' : op.opType === 'KEY OPEN' ? 'text-emerald-400' : 'text-red-500 font-bold';
                return (
                  <div key={op.id} className={`flex items-center gap-2 px-3 py-2 hover:bg-slate-800/40 transition-colors ${i % 2 === 1 ? 'bg-slate-800/20' : ''}`}>
                    <span className="text-indigo-300 font-mono text-[11px] font-bold w-16 shrink-0 truncate">{op.unitId}</span>
                    <span className={`text-[9px] font-bold flex-1 truncate ${typeCls}`}>{op.opType}</span>
                    <span className={`text-[9px] font-bold px-1 py-0.5 rounded-full w-12 shrink-0 text-center ${stBadge}`}>{op.status}</span>
                    <button onClick={() => setSelectedOp(op)}
                      className="text-[9px] font-bold text-violet-400 hover:text-white px-1 py-0.5 rounded bg-violet-950/50 border border-violet-800/50 hover:bg-violet-700 hover:border-violet-500 transition-all w-10 shrink-0 text-center">
                      자세히
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 하단 버튼: 조작 시작 + 조작 완료 + 이력 조회 */}
          <div className="flex flex-col gap-2 pl-3 pr-6 pt-2 pb-3 shrink-0">
            {SIDE_BUTTONS.filter(b => b.action !== 'registration' && b.action !== 'status').map(({ label, sub, action }) => {
              const isActive = activeSideBtn === label;
              return (
                <button key={label}
                  onClick={() => {
                    setActiveSideBtn(label);
                    if (action === 'start') setShowStart(true);
                    if (action === 'complete') setShowComplete(true);
                    if (action === 'history') setShowHistory(true);
                  }}
                  className={`w-full rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 ${isActive
                    ? 'bg-[#6B5EF8] hover:bg-[#7B6EFF] shadow-md shadow-violet-900/40 py-4'
                    : 'bg-[#1e2a3e] hover:bg-[#253348] border border-slate-700/50 hover:border-slate-600 py-3.5'
                    }`}
                >
                  <span className={`text-[13px] font-bold tracking-tight leading-none ${isActive ? 'text-white' : 'text-slate-200'}`}>{label}</span>
                  <span className={`text-[9px] font-semibold tracking-[0.2em] uppercase leading-none ${isActive ? 'text-violet-200' : 'text-slate-500'}`}>{sub}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
