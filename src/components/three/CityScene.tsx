import { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Instance, Instances, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { BUILDING_TEMPLATES } from '../../data/buildings';
import type { Block, Building, ColorGroup } from '../../types/game';

const BLOCK_SIZE = 12;
const BLOCK_GAP = 0.5;
const STREET_WIDTH = 2;

const COLOR_MAP: Record<ColorGroup, string> = {
  brown: '#8B6914',
  lightblue: '#6CB4D8',
  pink: '#E87DA0',
  orange: '#E8962C',
  red: '#D63030',
  yellow: '#D4C830',
  green: '#2C8B2C',
  darkblue: '#2C3CB4',
  railroad: '#666666',
  utility: '#888888',
  special: '#555555',
};

// --- Block Mesh ---
function BlockMesh({ block, isSelected }: { block: Block; isSelected: boolean }) {
  const selectBlock = useGameStore(s => s.selectBlock);
  const meshRef = useRef<THREE.Mesh>(null);

  const x = block.gridX * (BLOCK_SIZE + STREET_WIDTH);
  const z = block.gridY * (BLOCK_SIZE + STREET_WIDTH);
  const baseColor = COLOR_MAP[block.colorGroup] || '#444444';
  const borderColor = isSelected ? '#FFFFFF' : baseColor;

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    selectBlock(block.id);
  }, [block.id, selectBlock]);

  // Animate selection
  useFrame(() => {
    if (meshRef.current) {
      const targetY = isSelected ? 0.15 : 0;
      meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.1;
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Ground plane */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        receiveShadow
      >
        <boxGeometry args={[BLOCK_SIZE, 0.3, BLOCK_SIZE]} />
        <meshStandardMaterial
          color={isSelected ? '#FFFFCC' : '#8B9B6B'}
          emissive={isSelected ? '#333300' : '#000000'}
        />
      </mesh>

      {/* Color border strip */}
      <mesh position={[0, 0.16, -BLOCK_SIZE / 2 + 0.15]}>
        <boxGeometry args={[BLOCK_SIZE, 0.05, 0.3]} />
        <meshStandardMaterial color={borderColor} emissive={borderColor} emissiveIntensity={0.3} />
      </mesh>

      {/* Block label */}
      <Text
        position={[0, 0.5, -BLOCK_SIZE / 2 + 1]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.8}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {block.name}
      </Text>

      {/* Prestige stars */}
      {Array.from({ length: block.prestige }).map((_, i) => (
        <mesh key={i} position={[-BLOCK_SIZE / 2 + 1 + i * 0.8, 0.3, -BLOCK_SIZE / 2 + 2]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* Buildings */}
      {block.buildings.map((building, i) => (
        <BuildingMesh key={building.id} building={building} index={i} />
      ))}

      {/* Parks (green patches) */}
      {block.parkUnits > 0 && (
        <mesh position={[BLOCK_SIZE / 2 - 2, 0.17, BLOCK_SIZE / 2 - 2]}>
          <boxGeometry args={[3, 0.02, 3]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
      )}

      {/* Special block icon */}
      {block.isSpecial && (
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[2, 3, 2]} />
          <meshStandardMaterial
            color={block.specialType === 'railroad' ? '#555555' : block.specialType === 'utility' ? '#4488AA' : '#886644'}
            transparent
            opacity={0.7}
          />
        </mesh>
      )}
    </group>
  );
}

// --- Building Mesh ---
function BuildingMesh({ building, index }: { building: Building; index: number }) {
  const template = BUILDING_TEMPLATES[building.type];
  const col = index % 5;
  const row = Math.floor(index / 5);
  const height = building.level * 1.5 + (template.category === 'residential' ? 1 : 0);

  const x = -BLOCK_SIZE / 2 + 2 + col * 2;
  const z = -BLOCK_SIZE / 2 + 4 + row * 2.5;

  return (
    <mesh position={[x, height / 2 + 0.15, z]} castShadow>
      <boxGeometry args={[1.5, height, 1.5]} />
      <meshStandardMaterial
        color={template.color}
        emissive={building.isOpen ? template.color : '#222222'}
        emissiveIntensity={building.isOpen ? 0.15 : 0}
      />
    </mesh>
  );
}

// --- Streets ---
function Streets({ width, height }: { width: number; height: number }) {
  const streets = useMemo(() => {
    const result: JSX.Element[] = [];
    const totalW = width * (BLOCK_SIZE + STREET_WIDTH);
    const totalH = height * (BLOCK_SIZE + STREET_WIDTH);

    // Horizontal streets
    for (let y = 0; y <= height; y++) {
      const z = y * (BLOCK_SIZE + STREET_WIDTH) - STREET_WIDTH / 2 - BLOCK_SIZE / 2;
      result.push(
        <mesh key={`h${y}`} position={[totalW / 2 - (BLOCK_SIZE + STREET_WIDTH) / 2, -0.01, z]} receiveShadow>
          <boxGeometry args={[totalW, 0.05, STREET_WIDTH]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      );
    }

    // Vertical streets
    for (let x = 0; x <= width; x++) {
      const px = x * (BLOCK_SIZE + STREET_WIDTH) - STREET_WIDTH / 2 - BLOCK_SIZE / 2;
      result.push(
        <mesh key={`v${x}`} position={[px, -0.01, totalH / 2 - (BLOCK_SIZE + STREET_WIDTH) / 2]} receiveShadow>
          <boxGeometry args={[STREET_WIDTH, 0.05, totalH]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      );
    }

    return result;
  }, [width, height]);

  return <>{streets}</>;
}

// --- Citizens (instanced) ---
function CitizenInstances() {
  const citizens = useGameStore(s => s.citizens);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current) return;
    const count = Math.min(citizens.length, 500);
    for (let i = 0; i < count; i++) {
      const c = citizens[i];
      dummy.position.set(
        c.x * (BLOCK_SIZE + STREET_WIDTH),
        0.5,
        c.y * (BLOCK_SIZE + STREET_WIDTH)
      );
      dummy.scale.setScalar(0.3);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 500]} castShadow>
      <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
      <meshStandardMaterial color="#4488FF" />
    </instancedMesh>
  );
}

// --- Water ---
function Water() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = -0.5 + Math.sin(clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={[42, -0.5, 80]} receiveShadow>
      <boxGeometry args={[120, 0.1, 40]} />
      <meshStandardMaterial color="#1A5276" transparent opacity={0.8} />
    </mesh>
  );
}

// --- Camera Controller ---
function CameraController() {
  const cameraTarget = useGameStore(s => s.cameraTarget);
  const viewMode = useGameStore(s => s.viewMode);
  const { camera } = useThree();

  useFrame(() => {
    if (cameraTarget) {
      const targetPos = new THREE.Vector3(
        cameraTarget[0],
        viewMode === 'block' ? 15 : 60,
        cameraTarget[2] + (viewMode === 'block' ? 10 : 40)
      );
      camera.position.lerp(targetPos, 0.03);
      const lookAt = new THREE.Vector3(cameraTarget[0], 0, cameraTarget[2]);
      camera.lookAt(lookAt);
    }
  });

  return null;
}

// --- Era post-processing (simple color shift) ---
function EraLighting() {
  const era = useGameStore(s => s.time.era);
  const lightRef = useRef<THREE.DirectionalLight>(null);

  const eraColors: Record<string, string> = {
    '1930s': '#FFE4B5',
    '1940s': '#F5DEB3',
    '1950s': '#FFFACD',
    '1960s': '#FFF8DC',
    '1970s': '#FAFAD2',
    '1980s': '#FFFFF0',
    '1990s': '#F8F8FF',
    '2000s': '#FFFFFF',
  };

  return (
    <>
      <ambientLight intensity={0.4} color={eraColors[era] || '#FFFFFF'} />
      <directionalLight
        ref={lightRef}
        position={[50, 80, 30]}
        intensity={1.2}
        color={eraColors[era] || '#FFFFFF'}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
    </>
  );
}

// --- Main City Scene ---
export function CityScene() {
  const blocks = useGameStore(s => s.city.blocks);
  const selectedBlockId = useGameStore(s => s.selectedBlockId);
  const selectBlock = useGameStore(s => s.selectBlock);

  return (
    <Canvas
      shadows
      camera={{ position: [42, 60, 80], fov: 45, near: 0.1, far: 500 }}
      style={{ background: '#1a1a2e' }}
      onPointerMissed={() => selectBlock(null)}
    >
      <EraLighting />
      <Sky sunPosition={[100, 50, 100]} turbidity={8} rayleigh={2} />
      <fog attach="fog" args={['#1a1a2e', 100, 250]} />

      <Streets width={7} height={7} />

      {blocks.map(block => (
        <BlockMesh
          key={block.id}
          block={block}
          isSelected={block.id === selectedBlockId}
        />
      ))}

      <CitizenInstances />
      <Water />

      <CameraController />
      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate
        maxPolarAngle={Math.PI / 2.2}
        minDistance={10}
        maxDistance={150}
        target={[42, 0, 42]}
      />

      {/* Ground plane for far background */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[42, -0.2, 42]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#2F4F2F" />
      </mesh>
    </Canvas>
  );
}
