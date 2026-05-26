import { Environment, Html, OrbitControls, Text, useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { Suspense, memo, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { PANEL_DATA as SHARED_PANEL_DATA } from '../../data/panels'

type GlbKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

type PanelInfo = {
  glbKey: GlbKey
  unitId: string
  name: string
}

type Placement = {
  key: string
  position: [number, number, number]
  rotation: [number, number, number]
  panelId: number
  doubleHeight?: boolean
}

type Arrow = {
  position: [number, number, number]
  target: [number, number, number]
}

const GLB_VERSION = 'v1.1'
const PANEL_DATA: Record<number, PanelInfo> = SHARED_PANEL_DATA.reduce(
  (items, panel) => ({
    ...items,
    [panel.id]: { glbKey: panel.glbKey, unitId: panel.unitId, name: panel.name },
  }),
  {} as Record<number, PanelInfo>,
)

const FALLBACK_PANEL_DATA: Record<number, PanelInfo> = {
  1: { glbKey: 'A', unitId: 'UNIT-10E', name: 'PAF-C' },
  2: { glbKey: 'A', unitId: 'UNIT-10F', name: 'PAF-D' },
  3: { glbKey: 'A', unitId: 'UNIT-10C', name: 'PAF-A' },
  4: { glbKey: 'A', unitId: 'UNIT-10D', name: 'PAF-B' },
  5: { glbKey: 'F', unitId: 'UNIT-10A', name: 'BUS DUCT COMPARTMENT' },
  6: { glbKey: 'A', unitId: 'UNIT-10B', name: 'FDF-A' },
  7: { glbKey: 'B', unitId: 'UNIT-09A', name: 'PC TR UNIT-A' },
  8: { glbKey: 'B', unitId: 'UNIT-09B', name: 'IDF-A' },
  9: { glbKey: 'A', unitId: 'UNIT-08A', name: 'COP-A' },
  10: { glbKey: 'A', unitId: 'UNIT-08B', name: 'COP-B' },
  11: { glbKey: 'A', unitId: 'UNIT-07A', name: 'MTR SPARE' },
  12: { glbKey: 'A', unitId: 'UNIT-07B', name: 'STAGE 2 HAMMER MILL' },
  13: { glbKey: 'A', unitId: 'UNIT-06A', name: 'VERTICAL MILL C' },
  14: { glbKey: 'A', unitId: 'UNIT-06B', name: 'VERTICAL MILL D' },
  15: { glbKey: 'A', unitId: 'UNIT-05A', name: 'VERTICAL MILL A' },
  16: { glbKey: 'A', unitId: 'UNIT-05B', name: 'VERTICAL MILL B' },
  17: { glbKey: 'A', unitId: 'UNIT-04A', name: 'BFP-A' },
  18: { glbKey: 'A', unitId: 'UNIT-04B', name: 'BFP-B' },
  19: { glbKey: 'A', unitId: 'UNIT-03A', name: 'IDF-B' },
  20: { glbKey: 'A', unitId: 'UNIT-03B', name: 'FDF-B' },
  21: { glbKey: 'B', unitId: 'UNIT-02A', name: 'PC TR UNIT-B' },
  22: { glbKey: 'B', unitId: 'UNIT-02B', name: '#2 BIOMASS STORAGE BACK-UP TO DS' },
  23: { glbKey: 'E', unitId: 'UNIT-01A', name: 'AUX COMPARTMENT' },
  24: { glbKey: 'D', unitId: 'UNIT-01B', name: 'AUX TR INCOMING' },
  25: { glbKey: 'C', unitId: 'COM-20A', name: 'AUX COMPARTMENT' },
  26: { glbKey: 'D', unitId: 'COM-20B', name: 'START-UP TR INCOMING' },
  27: { glbKey: 'A', unitId: 'COM-19A', name: 'MOTOR SPARE' },
  28: { glbKey: 'B', unitId: 'COM-19B', name: 'INTAKE FEEDER' },
  29: { glbKey: 'B', unitId: 'COM-18A', name: 'PC TR COM-B' },
  30: { glbKey: 'B', unitId: 'COM-18B', name: 'FGD' },
  31: { glbKey: 'B', unitId: 'COM-17A', name: 'NO.2 2D BUS TIE' },
  32: { glbKey: 'B', unitId: 'COM-17B', name: 'NON MOTOR SPARE' },
  33: { glbKey: 'B', unitId: 'COM-16A', name: 'NO.2 2C BUS TIE' },
  34: { glbKey: 'B', unitId: 'COM-16B', name: 'PC TR COM-A' },
  35: { glbKey: 'A', unitId: 'COM-15A', name: '#1 NEW BUILDING TO DS' },
  36: { glbKey: 'A', unitId: 'COM-15B', name: 'BFP-C' },
  37: { glbKey: 'B', unitId: 'COM-14A', name: 'FLY ASH SYSTEM' },
  38: { glbKey: 'A', unitId: 'COM-14B', name: 'ASP-B' },
  39: { glbKey: 'B', unitId: 'COM-13A', name: '#3 BIOMASS STORAGE TO DS' },
  40: { glbKey: 'B', unitId: 'COM-13B', name: 'UNIT-COM BUS TIE' },
  41: { glbKey: 'A', unitId: 'UNIT-12A', name: 'MOTOR SPARE' },
  42: { glbKey: 'A', unitId: 'UNIT-12B', name: 'ASP-A' },
  43: { glbKey: 'F', unitId: 'UNIT-11A', name: 'BUS DUCT COMPARTMENT' },
  44: { glbKey: 'A', unitId: 'UNIT-11B', name: 'HGRF' },
  45: { glbKey: 'A', unitId: 'UNIT-10G', name: 'STAGE 1 HAMMER MILL' },
  46: { glbKey: 'B', unitId: 'UNIT-10H', name: 'NON MOTOR SPARE' },
  47: { glbKey: 'G', unitId: 'UNIT-10I', name: 'STAGE 1 HAMMER MILL VC' },
}

function getInfo(panelId: number) {
  return PANEL_DATA[panelId] ?? FALLBACK_PANEL_DATA[panelId] ?? { glbKey: 'A' as const, unitId: String(panelId).padStart(2, '0'), name: `PANEL ${panelId}` }
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function getPlacements() {
  const items: Placement[] = []
  const startX = 11
  const colWidth = 2
  const rowZ: [number, number] = [-4.9, 4.9]

  for (let col = 0; col < 12; col += 1) {
    for (let floor = 0; floor < 2; floor += 1) {
      const panelId = col * 2 + (floor === 1 ? 1 : 2)
      items.push({
        key: `right-${col}-${floor}`,
        position: [startX + col * colWidth, floor * 2.5, rowZ[1]],
        rotation: [0, Math.PI, 0],
        panelId,
      })
    }
  }

  for (let col = 0; col < 12; col += 1) {
    if (col === 0) {
      items.push({
        key: 'left-0-merged',
        position: [startX, 0, rowZ[0]],
        rotation: [0, 0, 0],
        panelId: 47,
        doubleHeight: true,
      })
      continue
    }

    for (let floor = 0; floor < 2; floor += 1) {
      const panelId = 47 - col * 2 + (floor === 1 ? 0 : 1)
      items.push({
        key: `left-${col}-${floor}`,
        position: [startX + col * colWidth, floor * 2.5, rowZ[0]],
        rotation: [0, 0, 0],
        panelId,
      })
    }
  }

  return items
}

const GLBClone = memo(function GLBClone({
  baseScene,
  glbBox,
  position,
  rotation,
  panelId,
  isActive,
  doubleHeight,
}: {
  baseScene: THREE.Group
  glbBox: THREE.Box3
  position: [number, number, number]
  rotation: [number, number, number]
  panelId: number
  isActive: boolean
  doubleHeight?: boolean
}) {
  const cloned = useMemo(() => baseScene.clone(), [baseScene])
  const overlayRef = useRef<THREE.MeshBasicMaterial>(null)
  const info = getInfo(panelId)

  useFrame(({ clock }) => {
    if (!overlayRef.current) return
    overlayRef.current.opacity = isActive && Math.floor(clock.elapsedTime * 6) % 2 === 0 ? 0.55 : 0
  })

  const { finalScale, modelOffset, height, depth } = useMemo(() => {
    const targetWidth = 2
    const targetHeight = doubleHeight ? 5.18 : 2.5
    const targetDepth = doubleHeight ? 0.96 : 1
    const size = glbBox.getSize(new THREE.Vector3())
    const center = glbBox.getCenter(new THREE.Vector3())
    const scaleX = targetWidth / size.x
    const scaleY = targetHeight / size.y
    const scaleZ = targetDepth / size.z

    return {
      finalScale: [scaleX, scaleY, scaleZ] as [number, number, number],
      modelOffset: [-center.x * scaleX, -glbBox.min.y * scaleY, -center.z * scaleZ] as [number, number, number],
      height: targetHeight,
      depth: targetDepth,
    }
  }, [doubleHeight, glbBox])

  return (
    <group position={position} rotation={rotation}>
      <primitive object={cloned} scale={finalScale} position={modelOffset} />
      <mesh position={[0, height / 2, depth / 2 + 0.006]}>
        <planeGeometry args={[2, height]} />
        <meshBasicMaterial ref={overlayRef} color="#dc2626" transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh position={[0, height * 0.83, depth / 2 + 0.004]}>
        <planeGeometry args={[1.4, height * 0.22]} />
        <meshStandardMaterial color="#c2ccd5" metalness={0.78} roughness={0.14} />
      </mesh>
      <Text
        position={[0, height * 0.88, depth / 2 + 0.008]}
        font="/fonts/Pretendard-Bold.woff"
        fontSize={0.14}
        color="#08111e"
        anchorX="center"
        anchorY="middle"
      >
        {info.unitId}
      </Text>
      <Text
        position={[0, height * 0.78, depth / 2 + 0.008]}
        font="/fonts/Pretendard-Bold.woff"
        fontSize={0.1}
        color="#243245"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.25}
      >
        {info.name}
      </Text>
    </group>
  )
})

function PathArrow({ position, target, index }: Arrow & { index: number }) {
  const ref = useRef<THREE.Group>(null)
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)

  useEffect(() => {
    ref.current?.position.set(...position)
    ref.current?.lookAt(...target)
  }, [position, target])

  useFrame(({ clock }) => {
    if (!materialRef.current) return
    materialRef.current.opacity = 0.2 + 0.8 * Math.max(0, Math.sin(clock.elapsedTime * 8 - index * 0.5))
  })

  const shape = useMemo(() => {
    const arrow = new THREE.Shape()
    arrow.moveTo(0, 0.3)
    arrow.lineTo(0.2, -0.1)
    arrow.lineTo(0.08, -0.1)
    arrow.lineTo(0.08, -0.4)
    arrow.lineTo(-0.08, -0.4)
    arrow.lineTo(-0.08, -0.1)
    arrow.lineTo(-0.2, -0.1)
    arrow.closePath()
    return arrow
  }, [])

  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial ref={materialRef} color="#ff3333" transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  )
}

function PanelGrid({ activePanelIds }: { activePanelIds: number[] }) {
  const { scene: sceneA } = useGLTF(`/A.glb?v=${GLB_VERSION}`)
  const { scene: sceneB } = useGLTF(`/B.glb?v=${GLB_VERSION}`)
  const { scene: sceneC } = useGLTF(`/C.glb?v=${GLB_VERSION}`)
  const { scene: sceneD } = useGLTF(`/D.glb?v=${GLB_VERSION}`)
  const { scene: sceneE } = useGLTF(`/E.glb?v=${GLB_VERSION}`)
  const { scene: sceneF } = useGLTF(`/F.glb?v=${GLB_VERSION}`)
  const { scene: sceneG } = useGLTF(`/G.glb?v=${GLB_VERSION}`)

  const sceneMap = useMemo<Record<GlbKey, THREE.Group>>(
    () => ({ A: sceneA, B: sceneB, C: sceneC, D: sceneD, E: sceneE, F: sceneF, G: sceneG }),
    [sceneA, sceneB, sceneC, sceneD, sceneE, sceneF, sceneG],
  )
  const boxMap = useMemo<Record<GlbKey, THREE.Box3>>(
    () => ({
      A: new THREE.Box3().setFromObject(sceneA),
      B: new THREE.Box3().setFromObject(sceneB),
      C: new THREE.Box3().setFromObject(sceneC),
      D: new THREE.Box3().setFromObject(sceneD),
      E: new THREE.Box3().setFromObject(sceneE),
      F: new THREE.Box3().setFromObject(sceneF),
      G: new THREE.Box3().setFromObject(sceneG),
    }),
    [sceneA, sceneB, sceneC, sceneD, sceneE, sceneF, sceneG],
  )

  const placements = useMemo<Placement[]>(getPlacements, [])

  return (
    <>
      {placements.map((placement) => {
        const glbKey = getInfo(placement.panelId).glbKey

        return (
          <GLBClone
            key={placement.key}
            baseScene={sceneMap[glbKey]}
            glbBox={boxMap[glbKey]}
            position={placement.position}
            rotation={placement.rotation}
            panelId={placement.panelId}
            isActive={activePanelIds.includes(placement.panelId)}
            doubleHeight={placement.doubleHeight}
          />
        )
      })}
    </>
  )
}

function Room() {
  const { scene: floorModel } = useGLTF(`/floor.glb?v=${GLB_VERSION}`)
  const { scene: ceilingModel } = useGLTF(`/ceiling.glb?v=${GLB_VERSION}`)

  const { floorScale, floorPos, ceilingScale, ceilingPos } = useMemo(() => {
    const targetWidth = 50
    const targetDepth = 10.4
    const floorBox = new THREE.Box3().setFromObject(floorModel)
    const ceilingBox = new THREE.Box3().setFromObject(ceilingModel)
    const floorSize = floorBox.getSize(new THREE.Vector3())
    const ceilingSize = ceilingBox.getSize(new THREE.Vector3())
    const floorScaleValue = [targetWidth / floorSize.x, 1, targetDepth / floorSize.z] as [number, number, number]
    const ceilingScaleValue = [targetWidth / ceilingSize.x, 1, targetDepth / ceilingSize.z] as [number, number, number]
    const floorCenter = floorBox.getCenter(new THREE.Vector3())
    const ceilingCenter = ceilingBox.getCenter(new THREE.Vector3())

    return {
      floorScale: floorScaleValue,
      ceilingScale: ceilingScaleValue,
      floorPos: [10 - floorCenter.x * floorScaleValue[0], -floorBox.min.y, -floorCenter.z * floorScaleValue[2]] as [number, number, number],
      ceilingPos: [10 - ceilingCenter.x * ceilingScaleValue[0], 6 - ceilingBox.min.y, -ceilingCenter.z * ceilingScaleValue[2]] as [number, number, number],
    }
  }, [ceilingModel, floorModel])

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[10, 15, 0]} intensity={1.8} castShadow />
      <pointLight position={[10, 5.8, 0]} intensity={1.5} color="#e2e8f0" />
      <pointLight position={[30, 5.8, 0]} intensity={1.5} color="#e2e8f0" />
      <Environment files="/textures/empty_warehouse_01_1k.hdr" background blur={0.8} />
      <primitive object={floorModel} scale={floorScale} position={floorPos} receiveShadow />
      <primitive object={ceilingModel} scale={ceilingScale} position={ceilingPos} receiveShadow />
      <mesh position={[10, 3, -5.2]}>
        <planeGeometry args={[50, 6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[10, 3, 5.2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[50, 6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[-15, 3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10.4, 6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[35, 3, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10.4, 6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.1} />
      </mesh>
      <Text position={[35.1, 3.4, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={1.6} color="#ffffff" anchorX="center">
        KOEN
      </Text>
      {[-5.1, 0.3, 5.7, 10.5, 15.3, 20.1, 24.9, 30.3].map((x) => (
        <mesh key={x} position={[x, 5.95, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.2, 1]} />
          <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </>
  )
}

function CameraController({ activePanelIds, onSequenceDone }: { activePanelIds: number[]; onSequenceDone?: () => void }) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)
  const placements = useMemo(getPlacements, [])
  const defaultTarget = useMemo(() => new THREE.Vector3(21, 2.8, 0), [])
  const [pathArrows, setPathArrows] = useState<Arrow[]>([])

  const computeArrows = (startPos: THREE.Vector3, panelPos: [number, number, number]) => {
    const aisleZ = 0
    const points = [
      startPos.clone().setY(0),
      new THREE.Vector3(startPos.x, 0, aisleZ),
      new THREE.Vector3(panelPos[0], 0, aisleZ),
      new THREE.Vector3(panelPos[0], 0, panelPos[2]),
    ]
    const clean = points.reduce<THREE.Vector3[]>((items, point) => {
      if (items.length === 0 || point.distanceTo(items[items.length - 1]) > 0.2) items.push(point)
      return items
    }, [])
    const curve = new THREE.CatmullRomCurve3(clean.length > 1 ? clean : [points[0], points[points.length - 1]], false, 'catmullrom', 0.1)
    const count = Math.max(3, Math.floor(curve.getLength() / 0.7))

    return Array.from({ length: count }, (_, index) => {
      const t = (index + 1) / (count + 1)
      const point = curve.getPoint(t)
      const ahead = curve.getPoint(Math.min(1, t + 0.05))
      let target: [number, number, number] = [ahead.x, 0.02, ahead.z]
      if (index === count - 1) target = [panelPos[0], 0.02, panelPos[2]]
      return { position: [point.x, 0.02, point.z] as [number, number, number], target }
    })
  }

  const goHome = () => new Promise<void>((resolve) => {
    if (!controlsRef.current) {
      resolve()
      return
    }

    const timeline = gsap.timeline({ onComplete: resolve })
    timeline.to(camera.position, {
      duration: 1.4,
      ease: 'power2.inOut',
      x: -6,
      y: 4,
      z: 0,
      onUpdate: () => controlsRef.current?.update(),
    }, 0)
    timeline.to(controlsRef.current.target, {
      duration: 1.4,
      ease: 'power2.inOut',
      x: 21,
      y: 2.8,
      z: 0,
      onUpdate: () => controlsRef.current?.update(),
    }, 0)
  })

  const walkToPanel = (target: { x: number; y: number; z: number; camZ: number }) => new Promise<void>((resolve) => {
    if (!controlsRef.current) {
      resolve()
      return
    }

    const timeline = gsap.timeline({ onComplete: resolve })
    timeline.to(camera.position, {
      duration: 1.8,
      ease: 'power2.inOut',
      x: target.x,
      y: target.y,
      z: target.camZ,
      onUpdate: () => controlsRef.current?.update(),
    }, 0)
    timeline.to(controlsRef.current.target, {
      duration: 1.8,
      ease: 'power2.inOut',
      x: target.x,
      y: target.y,
      z: target.z,
      onUpdate: () => controlsRef.current?.update(),
    }, 0)
  })

  useEffect(() => {
    setPathArrows([])

    if (activePanelIds.length === 0) return

    if (activePanelIds.length > 1) {
      const timer = window.setTimeout(() => {
        onSequenceDone?.()
      }, 5000)
      return () => window.clearTimeout(timer)
    }

    const placement = placements.find((item) => item.panelId === activePanelIds[0])
    if (!placement) return

    let cancelled = false
    const [x, y, z] = placement.position
    const panelTarget = {
      x,
      y: y + (placement.doubleHeight ? 2.8 : 1.5),
      z,
      camZ: z + (z > 0 ? 8 : -8),
    }

    const run = async () => {
      await wait(350)
      if (cancelled) return

      const arrows = computeArrows(camera.position.clone(), [x, 0, z])
      for (let index = 0; index < 3; index += 1) {
        if (cancelled) return
        setPathArrows(arrows)
        await wait(260)
        setPathArrows([])
        await wait(180)
      }

      if (cancelled) return
      setPathArrows(arrows)
      await wait(250)
      if (cancelled) return

      await walkToPanel(panelTarget)
      if (cancelled) return
      setPathArrows([])
      await wait(650)
      if (cancelled) return

      await goHome()
      if (cancelled) return
      await wait(900)
      if (cancelled) return

      onSequenceDone?.()
    }

    run()

    return () => {
      cancelled = true
      setPathArrows([])
      gsap.killTweensOf(camera.position)
      if (controlsRef.current?.target) {
        gsap.killTweensOf(controlsRef.current.target)
        controlsRef.current.update()
      }
    }
  }, [activePanelIds.join(','), camera, onSequenceDone, placements])

  return (
    <>
      <OrbitControls ref={controlsRef} target={defaultTarget} enablePan={false} minDistance={4} maxDistance={70} />
      {pathArrows.map((arrow, index) => <PathArrow key={`${arrow.position.join('-')}-${index}`} {...arrow} index={index} />)}
    </>
  )
}

export function ThreePanelViewer({ activePanelIds = [], onSequenceDone }: { activePanelIds?: number[]; onSequenceDone?: () => void }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [-6, 4, 0], fov: 30, near: 0.1, far: 1000 }}
      className="h-full w-full"
      gl={{ antialias: true }}
    >
      <Suspense
        fallback={
          <Html center>
            <div className="rounded-lg bg-slate-950/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Loading 3D
            </div>
          </Html>
        }
      >
        <color attach="background" args={['#0a0a0a']} />
        <CameraController activePanelIds={activePanelIds} onSequenceDone={onSequenceDone} />
        <PanelGrid activePanelIds={activePanelIds} />
        <Room />
      </Suspense>
    </Canvas>
  )
}

useGLTF.preload(`/A.glb?v=${GLB_VERSION}`)
useGLTF.preload(`/B.glb?v=${GLB_VERSION}`)
useGLTF.preload(`/C.glb?v=${GLB_VERSION}`)
useGLTF.preload(`/D.glb?v=${GLB_VERSION}`)
useGLTF.preload(`/E.glb?v=${GLB_VERSION}`)
useGLTF.preload(`/F.glb?v=${GLB_VERSION}`)
useGLTF.preload(`/G.glb?v=${GLB_VERSION}`)
useGLTF.preload(`/floor.glb?v=${GLB_VERSION}`)
useGLTF.preload(`/ceiling.glb?v=${GLB_VERSION}`)
