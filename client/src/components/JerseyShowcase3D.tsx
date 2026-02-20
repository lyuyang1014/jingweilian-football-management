import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useState, Suspense, useEffect, useMemo } from "react";
import { SITE_ASSETS } from "@shared/constants";

// Create a jersey-shaped geometry procedurally
function createJerseyGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();

  // Jersey outline (front view, normalized to ~2 units wide, ~2.5 tall)
  // Collar
  shape.moveTo(-0.3, 1.2);
  shape.quadraticCurveTo(-0.15, 1.3, 0, 1.25);
  shape.quadraticCurveTo(0.15, 1.3, 0.3, 1.2);

  // Right shoulder to sleeve
  shape.lineTo(0.5, 1.15);
  shape.lineTo(0.95, 0.85);
  shape.lineTo(1.0, 0.8);
  // Right sleeve bottom
  shape.lineTo(0.95, 0.45);
  shape.lineTo(0.85, 0.42);
  // Right armpit
  shape.lineTo(0.55, 0.7);
  // Right side body
  shape.lineTo(0.5, 0.0);
  shape.quadraticCurveTo(0.48, -0.8, 0.5, -1.1);
  // Bottom hem
  shape.quadraticCurveTo(0.25, -1.15, 0, -1.12);
  shape.quadraticCurveTo(-0.25, -1.15, -0.5, -1.1);
  // Left side body
  shape.quadraticCurveTo(-0.48, -0.8, -0.5, 0.0);
  // Left armpit
  shape.lineTo(-0.55, 0.7);
  shape.lineTo(-0.85, 0.42);
  shape.lineTo(-0.95, 0.45);
  // Left sleeve
  shape.lineTo(-1.0, 0.8);
  shape.lineTo(-0.95, 0.85);
  shape.lineTo(-0.5, 1.15);
  shape.lineTo(-0.3, 1.2);

  const extrudeSettings = {
    depth: 0.15,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 3,
    curveSegments: 24,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.center();
  return geometry;
}

function JerseyModel({
  jerseyColor,
  autoRotate = true,
}: {
  jerseyColor: string;
  autoRotate?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => createJerseyGeometry(), []);

  useFrame((_, delta) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  // Create materials array for the extruded geometry
  // ExtrudeGeometry has groups: 0 = front face, 1 = back face, 2 = side
  const materials = useMemo(() => {
    const colorHex = parseInt(jerseyColor.replace('#', ''), 16);
    
    const frontMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.6,
      metalness: 0.1,
      side: THREE.FrontSide,
    });

    const backMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.6,
      metalness: 0.1,
      side: THREE.FrontSide,
    });

    const sideMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.7,
      metalness: 0.05,
    });

    return [frontMat, sideMat, backMat];
  }, [jerseyColor]);

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      {materials.map((mat, i) => (
        <primitive key={i} object={mat} attach={`material-${i}`} />
      ))}
    </mesh>
  );
}

function JerseyScene({
  jerseyColor,
}: {
  jerseyColor: string;
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-3, 3, -5]} intensity={0.4} />
      <pointLight position={[0, 2, 3]} intensity={0.5} color="#88ccff" />

      <JerseyModel jerseyColor={jerseyColor} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate={false}
      />
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        <span className="text-white/30 text-xs">加载3D模型...</span>
      </div>
    </div>
  );
}

export default function JerseyShowcase3D() {
  const [activeJersey, setActiveJersey] = useState<"home" | "away">("home");

  const jerseys = {
    home: {
      color: "#ffffff",
      front: SITE_ASSETS.jerseyHomeFront,
      back: SITE_ASSETS.jerseyHomeBack,
      name: "主场队服",
      sub: "HOME JERSEY · KIT 01",
      desc: "白色主场队服，胸前印有京蔚联狮子logo和YOUMAGIC赞助商标识",
    },
    away: {
      color: "#dc2626",
      front: SITE_ASSETS.jerseyAwayFront,
      back: SITE_ASSETS.jerseyAwayBack,
      name: "客场队服",
      sub: "AWAY JERSEY · KIT 02",
      desc: "红色客场队服，激情与活力的象征，展现球队的战斗精神",
    },
  };

  const current = jerseys[activeJersey];

  return (
    <section className="py-24 bg-[#03060d] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/[0.03] rounded-full blur-[120px]" />

      <div className="container relative z-10">
        <div className="text-center mb-12">
          <span className="text-cyan-400/60 text-xs font-[Oswald] tracking-[0.3em] block mb-3">TEAM JERSEYS</span>
          <h2 className="text-3xl md:text-5xl font-[Oswald] text-white font-bold mb-4">球队队服</h2>

          {/* Jersey toggle */}
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => setActiveJersey("home")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeJersey === "home"
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
              }`}
            >
              主场
            </button>
            <button
              onClick={() => setActiveJersey("away")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeJersey === "away"
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
              }`}
            >
              客场
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* 3D Canvas */}
            <div className="relative aspect-square bg-gradient-to-b from-white/[0.02] to-transparent rounded-2xl border border-white/5 overflow-hidden">
              <Suspense fallback={<LoadingFallback />}>
                <Canvas
                  camera={{ position: [0, 0, 3.2], fov: 45 }}
                  style={{ background: "transparent" }}
                  gl={{ antialias: true, alpha: true }}
                >
                  <JerseyScene
                    key={activeJersey}
                    jerseyColor={current.color}
                  />
                </Canvas>
              </Suspense>

              {/* Drag hint */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/20 text-xs">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 9l-3 3 3 3M19 9l3 3-3 3M9 5l3-3 3 3M9 19l3 3 3-3" />
                </svg>
                拖拽旋转查看
              </div>
            </div>

            {/* Jersey info */}
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-white font-[Oswald] text-2xl mb-1">{current.name}</h3>
                <p className="text-white/30 text-xs font-[Oswald] tracking-wider">{current.sub}</p>
              </div>

              <p className="text-white/40 text-sm leading-relaxed">{current.desc}</p>

              {/* Static front/back preview */}
              <div className="flex gap-4 mt-2">
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex-1 text-center">
                  <img src={current.front} alt="正面" className="h-40 object-contain mx-auto mb-2" />
                  <span className="text-white/30 text-xs">正面</span>
                </div>
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex-1 text-center">
                  <img src={current.back} alt="背面" className="h-40 object-contain mx-auto mb-2" />
                  <span className="text-white/30 text-xs">背面</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
