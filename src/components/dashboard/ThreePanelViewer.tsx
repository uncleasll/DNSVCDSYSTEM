import { ContactShadows, Environment, Float, Html, OrbitControls, Text, useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import gsap from 'gsap'
import { Suspense, memo, useEffect, useMemo, useRef, useState } from 'react'
import { ToneMappingMode } from 'postprocessing'
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
    overlayRef.current.opacity = isActive ? 0.22 + 0.18 * Math.sin(clock.elapsedTime * 5) : 0
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
        <meshBasicMaterial ref={overlayRef} color="#ef4444" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, height / 2, depth / 2 + 0.01]}>
        <planeGeometry args={[2.05, height + 0.05]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={isActive ? 0.18 : 0} depthWrite={false} side={THREE.DoubleSide} />
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
      <spotLight position={[0, 8, 0]} angle={0.6} penumbra={1} intensity={3} castShadow />
      <rectAreaLight width={20} height={1} position={[10, 5.8, 0]} rotation={[-Math.PI / 2, 0, 0]} intensity={6} color="#f8fafc" />
      <rectAreaLight width={20} height={1} position={[30, 5.8, 0]} rotation={[-Math.PI / 2, 0, 0]} intensity={6} color="#f8fafc" />
      <Environment files="/textures/empty_warehouse_01_1k.hdr" background blur={0.8} />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.7} scale={80} blur={2.5} far={10} resolution={1024} color="#000000" />
      <EffectComposer>
        <Bloom luminanceThreshold={1.2} mipmapBlur intensity={0.8} radius={0.3} />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
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
        <group position={[0, 0.5, 0.05]}>
          <mesh>
            <boxGeometry args={[10, 4, 0.2]} />
            <meshStandardMaterial color="#020617" roughness={0.7} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.11]}>
            <planeGeometry args={[9.8, 3.8]} />
            <meshStandardMaterial color="#0f172a" emissive="#0ea5e9" emissiveIntensity={0.3} roughness={0.1} metalness={0.9} />
          </mesh>
          <Text position={[0, 0.4, 0.18]} fontSize={2.5} color="#ffffff" anchorX="center" anchorY="middle" fontStyle="italic">
            KOEN
            <meshStandardMaterial color="#ffffff" emissive="#38bdf8" emissiveIntensity={1.5} roughness={0.2} metalness={0.8} />
          </Text>
          <Text position={[0, -1.1, 0.18]} font="/fonts/Pretendard-Bold.woff" fontSize={0.7} color="#475569" anchorX="center" anchorY="middle">
            한국남동발전
          </Text>
        </group>
      </mesh>
      {[-5.1, 0.3, 5.7, 10.5, 15.3, 20.1, 24.9, 30.3].map((x) => (
        <group key={x}>
          <mesh position={[x, 5.95, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.2, 0.6]} />
            <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[x, 5.95, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.2, 0.6]} />
            <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}
    </>
  )
}

function CameraController({
  activePanelIds,
  sequenceId,
  isOperationActive,
  onCameraUpdate,
  onSequenceDone,
}: {
  activePanelIds: number[]
  sequenceId: number
  isOperationActive: boolean
  onCameraUpdate?: (position: { x: number; z: number; rotation: number }) => void
  onSequenceDone?: () => void
}) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)
  const placements = useMemo(getPlacements, [])
  const defaultTarget = useMemo(() => new THREE.Vector3(40, 2.8, 0), [])
  const activePanelKey = activePanelIds.join(',')
  const [pathArrows, setPathArrows] = useState<Arrow[]>([])
  const [blinkingIds, setBlinkingIds] = useState<number[]>([])
  const [moving, setMoving] = useState(false)
  const sequenceRunning = useRef(false)
  const lastSequenceId = useRef(0)
  const keys = useRef<Record<string, boolean>>({})
  const lastUpdatePos = useRef(new THREE.Vector3())
  const lastUpdateRot = useRef(0)

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
      setMoving(false)
      resolve()
      return
    }

    setMoving(true)
    const timeline = gsap.timeline({ onComplete: () => { setMoving(false); resolve() } })
    timeline.to(camera.position, {
      duration: 3.5,
      ease: 'power2.inOut',
      x: -6,
      y: 4,
      z: 0,
      onUpdate: () => controlsRef.current?.update(),
    }, 0)
    timeline.to(controlsRef.current.target, {
      duration: 3.5,
      ease: 'power2.inOut',
      x: 40,
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

    setMoving(true)
    const timeline = gsap.timeline({ onComplete: () => window.setTimeout(resolve, 2000) })
    timeline.to(camera.position, {
      duration: 4.5,
      ease: 'power2.inOut',
      x: target.x,
      y: target.y,
      z: target.camZ,
      onUpdate: () => controlsRef.current?.update(),
    }, 0)
    timeline.to(controlsRef.current.target, {
      duration: 4.5,
      ease: 'power2.inOut',
      x: target.x,
      y: target.y,
      z: target.z,
      onUpdate: () => controlsRef.current?.update(),
    }, 0)
  })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keys.current[event.key] = true
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      keys.current[event.key] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((state, delta) => {
    const px = Math.round(state.camera.position.x * 100) / 100
    const pz = Math.round(state.camera.position.z * 100) / 100
    const rotation = Math.round(state.camera.rotation.y * 1000) / 1000
    if (px !== lastUpdatePos.current.x || pz !== lastUpdatePos.current.z || rotation !== lastUpdateRot.current) {
      onCameraUpdate?.({ x: px, z: pz, rotation })
      lastUpdatePos.current.set(px, state.camera.position.y, pz)
      lastUpdateRot.current = rotation
    }

    if (moving || sequenceRunning.current || !isOperationActive) return

    const direction = new THREE.Vector3()
    const frontVector = new THREE.Vector3()
    const sideVector = new THREE.Vector3()
    const speed = 0.75 * delta

    camera.getWorldDirection(frontVector)
    frontVector.y = 0
    frontVector.normalize()
    sideVector.copy(frontVector).cross(camera.up).normalize()

    if (keys.current.ArrowUp || keys.current.w || keys.current.W) direction.add(frontVector)
    if (keys.current.ArrowDown || keys.current.s || keys.current.S) direction.add(frontVector.clone().negate())
    if (keys.current.ArrowLeft || keys.current.a || keys.current.A) direction.add(sideVector.clone().negate())
    if (keys.current.ArrowRight || keys.current.d || keys.current.D) direction.add(sideVector)

    if (direction.length() === 0) return

    if (pathArrows.length > 0) setPathArrows([])
    direction.normalize().multiplyScalar(speed)

    const nextPos = camera.position.clone().add(direction)
    const isInsidePanelRow1 = nextPos.z > -4.4 && nextPos.z < -3.6 && nextPos.x > -10 && nextPos.x < 10
    const isInsidePanelRow2 = nextPos.z > 3.6 && nextPos.z < 4.4 && nextPos.x > -10 && nextPos.x < 10
    const isOutsideRoom = nextPos.x < -24 || nextPos.x > 35 || Math.abs(nextPos.z) > 4.2

    if (!isInsidePanelRow1 && !isInsidePanelRow2 && !isOutsideRoom) {
      camera.position.add(direction)
      controlsRef.current?.target.add(direction)
      controlsRef.current?.update()
    }
  })

  useEffect(() => {
    setPathArrows([])

    if (sequenceId === 0 || sequenceId === lastSequenceId.current || activePanelIds.length === 0) return
    lastSequenceId.current = sequenceId

    if (activePanelIds.length > 1) {
      setBlinkingIds(activePanelIds)
      const timer = window.setTimeout(() => {
        setBlinkingIds([])
        onSequenceDone?.()
      }, 5000)
      return () => window.clearTimeout(timer)
    }

    let cancelled = false
    sequenceRunning.current = true

    const run = async () => {
      setBlinkingIds(activePanelIds)

      let closestPanelId = activePanelIds[0]
      let minDistance = Infinity
      const startX = 11
      const colWidth = 2
      const floorHeight = 2.5
      const rowZ: [number, number] = [-4.9, 4.9]

      for (const panelId of activePanelIds) {
        let row: number
        let col: number

        if (panelId <= 24) {
          row = 1
          col = Math.floor((panelId - 1) / 2)
        } else if (panelId === 47) {
          row = 0
          col = 0
        } else {
          row = 0
          const startId = panelId % 2 === 1 ? panelId : panelId - 1
          col = (47 - startId) / 2
        }

        const exactX = startX + col * colWidth
        const exactZ = rowZ[row]
        const distance = Math.hypot(camera.position.x - exactX, camera.position.z - exactZ)
        if (distance < minDistance) {
          minDistance = distance
          closestPanelId = panelId
        }
      }

      const panelId = closestPanelId
      let row: number
      let col: number
      let floor: number

      if (panelId <= 24) {
        row = 1
        col = Math.floor((panelId - 1) / 2)
        floor = panelId % 2 === 1 ? 1 : 0
      } else if (panelId === 47) {
        row = 0
        col = 0
        floor = 1
      } else {
        row = 0
        const startId = panelId % 2 === 1 ? panelId : panelId - 1
        col = (47 - startId) / 2
        floor = panelId % 2 === 1 ? 1 : 0
      }

      const exactX = startX + col * colWidth
      const exactY = floor * floorHeight + (panelId === 47 ? floorHeight : floorHeight / 2)
      const exactZ = rowZ[row]
      const camZ = row === 0 ? exactZ + 8 : exactZ - 8

      for (let cycle = 0; cycle < 2; cycle += 1) {
        await wait(1000)
        if (cancelled) return

        const arrows = computeArrows(camera.position.clone(), [exactX, 0, rowZ[row]])
        for (let index = 0; index < 3; index += 1) {
          if (cancelled) return
          setPathArrows(arrows)
          await wait(350)
          setPathArrows([])
          await wait(250)
        }

        if (cancelled) return
        setPathArrows(arrows)
        await wait(300)

        await walkToPanel({ x: exactX, y: exactY, z: exactZ, camZ })
        if (cancelled) return
        setPathArrows([])

        await goHome()
        if (cancelled) return
      }

      await wait(5000)
      if (cancelled) return
      setBlinkingIds([])
      sequenceRunning.current = false
      onSequenceDone?.()
    }

    run()

    return () => {
      cancelled = true
      sequenceRunning.current = false
      setMoving(false)
      setBlinkingIds([])
      setPathArrows([])
      gsap.killTweensOf(camera.position)
      if (controlsRef.current?.target) {
        gsap.killTweensOf(controlsRef.current.target)
        controlsRef.current.update()
      }
    }
  }, [activePanelKey, camera, onSequenceDone, placements, sequenceId])

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={defaultTarget}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        enablePan={false}
        enableRotate={false}
        enableZoom={false}
        minDistance={4}
        maxDistance={70}
      />
      {pathArrows.map((arrow, index) => <PathArrow key={`${arrow.position.join('-')}-${index}`} {...arrow} index={index} />)}
      <PanelGrid activePanelIds={blinkingIds} />
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
        <Text position={[0, 4.5, -8]} fontSize={0.6} color="#10b981" maxWidth={10} textAlign="center">
          ELECTRICAL PANEL MONITORING
        </Text>
        <Text position={[0, 3.8, -8]} fontSize={0.2} color="#475569" fillOpacity={0.8}>
          {moving ? 'Walking to panel...' : 'Use Arrow Keys to walk'}
        </Text>
      </Float>
    </>
  )
}

export function ThreePanelViewer({
  activePanelIds = [],
  sequenceId = 0,
  isOperationActive = false,
  onCameraUpdate,
  onSequenceDone,
}: {
  activePanelIds?: number[]
  sequenceId?: number
  isOperationActive?: boolean
  onCameraUpdate?: (position: { x: number; z: number; rotation: number }) => void
  onSequenceDone?: () => void
}) {
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
        <CameraController
          activePanelIds={activePanelIds}
          sequenceId={sequenceId}
          isOperationActive={isOperationActive}
          onCameraUpdate={onCameraUpdate}
          onSequenceDone={onSequenceDone}
        />
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
